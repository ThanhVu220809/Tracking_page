import type { AppCopy } from "../../i18n";
import logo from "../../img/logo.png";
import product01 from "../../img/product-01.jpg";
import product012 from "../../img/product-01-2.jpg";
import product02 from "../../img/product-02.jpg";
import product022 from "../../img/product-02-2.jpg";
import process01 from "../../img/process-01.jpg";
import process02 from "../../img/process-02.jpg";
import process03 from "../../img/process-03.jpg";
import process04 from "../../img/process-04.jpg";
import zaloQr from "../../img/zalo-qr.jpg";

type BrandingShowcaseProps = {
  copy: AppCopy;
};

type GalleryItem = {
  alt: string;
  src: string;
};

const PRODUCT_IMAGES: GalleryItem[] = [
  { alt: "Thiết bị BA.SEW phiên bản sản phẩm 02-2", src: product022 },
  { alt: "Thiết bị BA.SEW phiên bản sản phẩm 01", src: product01 },
  { alt: "Thiết bị BA.SEW phiên bản sản phẩm 01-2", src: product012 },
  { alt: "Thiết bị BA.SEW phiên bản sản phẩm 02", src: product02 },
];

const PROCESS_IMAGES: GalleryItem[] = [
  { alt: "Quy trình phát triển BA.SEW giai đoạn 01", src: process01 },
  { alt: "Quy trình phát triển BA.SEW giai đoạn 02", src: process02 },
  { alt: "Quy trình phát triển BA.SEW giai đoạn 03", src: process03 },
  { alt: "Quy trình phát triển BA.SEW giai đoạn 04", src: process04 },
];

export function BrandingShowcase({ copy }: BrandingShowcaseProps) {
  return (
    <div className="showcase">
      <section className="showcase-hero">
        <div className="showcase-hero__info">
          <img className="showcase-hero__logo" src={logo} alt="Logo BA.SEW" loading="lazy" />
          <h3>{copy.showcaseTitle}</h3>
          <p>{copy.showcaseSubtitle}</p>
          <span className="showcase-hero__badge">{copy.brand}</span>
        </div>

        <div className="showcase-hero__visual" aria-label={copy.productsTitle}>
          <figure className="showcase-photo showcase-photo--main">
            <img src={product022} alt="Ảnh sản phẩm BA.SEW nổi bật" loading="lazy" />
          </figure>
          <figure className="showcase-photo showcase-photo--float-one">
            <img src={product02} alt="Ảnh sản phẩm BA.SEW góc phụ 01" loading="lazy" />
          </figure>
          <figure className="showcase-photo showcase-photo--float-two">
            <img src={product012} alt="Ảnh sản phẩm BA.SEW góc phụ 02" loading="lazy" />
          </figure>
        </div>
      </section>

      <section className="showcase-section">
        <h4>{copy.productsTitle}</h4>
        <p>{copy.brandStory}</p>
        <div className="showcase-grid showcase-grid--products">
          {PRODUCT_IMAGES.map((image) => (
            <figure className="showcase-thumb" key={image.src}>
              <img src={image.src} alt={image.alt} loading="lazy" />
            </figure>
          ))}
        </div>
      </section>

      <section className="showcase-section">
        <h4>{copy.processTitle}</h4>
        <p>{copy.processSubtitle}</p>
        <div className="showcase-grid showcase-grid--process">
          {PROCESS_IMAGES.map((image) => (
            <figure className="showcase-thumb" key={image.src}>
              <img src={image.src} alt={image.alt} loading="lazy" />
            </figure>
          ))}
        </div>
      </section>

      <section className="showcase-qr-card">
        <div className="showcase-qr-card__head">
          <h4>{copy.qrTitle}</h4>
          <p>{copy.qrDescription}</p>
        </div>

        <figure className="showcase-qr-card__frame">
          <img src={zaloQr} alt="Mã QR liên hệ Zalo BA.SEW" loading="lazy" />
        </figure>

        <p className="showcase-qr-card__caption">{copy.qrCaption}</p>
      </section>
    </div>
  );
}
