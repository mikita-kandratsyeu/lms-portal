'use client';

import { InvisibleSmartCaptcha, InvisibleSmartCaptchaProps } from '@yandex/smart-captcha';

type CaptchaInvisibleProps = {
  callback: (token: string | null) => void;
  locale: string;
  setVisible: (value: boolean) => void;
  visible: boolean;
};

export const CaptchaInvisible = ({
  callback,
  locale,
  setVisible,
  visible,
}: CaptchaInvisibleProps) => {
  return (
    <div className="absolute">
      <InvisibleSmartCaptcha
        language={locale as InvisibleSmartCaptchaProps['language']}
        onChallengeHidden={() => setVisible(false)}
        onSuccess={callback}
        sitekey={process.env.NEXT_PUBLIC_YD_CAPTCHA as string}
        test={process.env.NODE_ENV === 'development'}
        visible={visible}
        webview
      />
    </div>
  );
};
