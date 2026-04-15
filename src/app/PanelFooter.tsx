import type { AppCopy } from "../i18n";

type PanelFooterProps = {
  copy: AppCopy;
  logoSrc: string;
};

export function PanelFooter({ copy, logoSrc }: PanelFooterProps) {
  return (
    <div className="panel-footer">
      <img src={logoSrc} alt="Logo BA.SEW" />
      <div className="panel-footer__copy">
        <p>{copy.footerNote}</p>
        <p className="panel-footer__legal">{copy.footerCopyright}</p>
        <p className="panel-footer__credit">{copy.footerCredit}</p>
      </div>
    </div>
  );
}
