type AttachedFile = {
  key: string;
  name: string;
  url: string;
};

type MessageInput = {
  content: string;
  role: string;
};

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

  if (attachedFile.name.toLowerCase().endsWith('.pdf')) {
    let pdfText = '';
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const response = await fetch(attachedFile.url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const data = await pdfParse(buffer);

      pdfText = (data as { text?: string }).text?.trim() ?? '';
    } catch (error) {
      console.error('[PDF_EXTRACT_ERROR]', error);
      pdfText = `[PDF file attached: ${attachedFile.name} - could not extract text. Please describe what you need from this document.]`;
    }

    const appendedText = textContent.trim()
      ? `${textContent}\n\n---\nDocument content:\n${pdfText}`
      : `Please analyze this document:\n\n${pdfText}`;

    const transformedInput = [...input];
    transformedInput[lastUserIndex] = {
      ...lastUserMessage,
      content: appendedText,
    };
    return transformedInput;
  }

  return input;
};
