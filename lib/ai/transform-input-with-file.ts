type AttachedFile = {
  key: string;
  name: string;
  url: string;
};

type MessageInput = {
  content: string;
  role: string;
};

async function fetchFileBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();

  return Buffer.from(arrayBuffer);
}

async function extractTextFromFile(attachedFile: AttachedFile): Promise<string> {
  const ext = attachedFile.name.toLowerCase().split('.').pop() ?? '';

  if (ext === 'pdf') {
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const buffer = await fetchFileBuffer(attachedFile.url);
      const data = await pdfParse(buffer);

      return (data as { text?: string }).text?.trim() ?? '';
    } catch (error) {
      console.error('[PDF_EXTRACT_ERROR]', error);
      return `[PDF file attached: ${attachedFile.name} - could not extract text. Please describe what you need from this document.]`;
    }
  }

  if (ext === 'csv') {
    try {
      const response = await fetch(attachedFile.url);
      const text = await response.text();

      return text.trim();
    } catch (error) {
      console.error('[CSV_EXTRACT_ERROR]', error);
      return `[CSV file attached: ${attachedFile.name} - could not extract text.]`;
    }
  }

  if (ext === 'doc' || ext === 'docx') {
    try {
      const WordExtractor = (await import('word-extractor')).default;
      const extractor = new WordExtractor();
      const buffer = await fetchFileBuffer(attachedFile.url);
      const doc = await extractor.extract(buffer);
      const body = doc.getBody();

      return (body ?? '').trim();
    } catch (error) {
      console.error('[WORD_EXTRACT_ERROR]', error);
      return `[Word file attached: ${attachedFile.name} - could not extract text. Please describe what you need from this document.]`;
    }
  }

  if (ext === 'xls' || ext === 'xlsx') {
    try {
      const XLSX = (await import('xlsx')).default;
      const buffer = await fetchFileBuffer(attachedFile.url);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const texts: string[] = [];

      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<string[]>(sheet, {
          header: 1,
          defval: '',
          raw: false,
        }) as string[][];

        const rows = json
          .map((row) =>
            Array.isArray(row) ? row.map((cell) => String(cell ?? '').trim()).join('\t') : '',
          )
          .filter((r) => r.trim());
        if (rows.length) {
          texts.push(`Sheet: ${sheetName}\n${rows.join('\n')}`);
        }
      }

      return texts.join('\n\n---\n\n');
    } catch (error) {
      console.error('[EXCEL_EXTRACT_ERROR]', error);
      return `[Excel file attached: ${attachedFile.name} - could not extract text. Please describe what you need from this document.]`;
    }
  }

  return '';
}

export const transformInputWithAttachedFile = async (
  input: MessageInput[],
  attachedFile: AttachedFile | undefined,
): Promise<MessageInput[]> => {
  if (!attachedFile || !input.length) {
    return input;
  }

  const lastUserIndex = input.map((m) => m.role).lastIndexOf('user');

  if (lastUserIndex === -1) {
    return input;
  }

  const lastUserMessage = input[lastUserIndex];
  const textContent = (lastUserMessage.content as string) || '';

  const supportedExts = ['pdf', 'csv', 'doc', 'docx', 'xls', 'xlsx'];
  const ext = attachedFile.name.toLowerCase().split('.').pop() ?? '';

  if (!supportedExts.includes(ext)) {
    return input;
  }

  const extractedText = await extractTextFromFile(attachedFile);
  if (!extractedText) {
    return input;
  }

  const appendedText = textContent.trim()
    ? `${textContent}\n\n---\nDocument content:\n${extractedText}`
    : `Please analyze this document:\n\n${extractedText}`;

  const transformedInput = [...input];

  transformedInput[lastUserIndex] = {
    ...lastUserMessage,
    content: appendedText,
  };

  return transformedInput;
};
