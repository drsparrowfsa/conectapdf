import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SeoProps {
    title: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
}

const Seo: React.FC<SeoProps> = ({
    title,
    description = "Converta, edite e otimize seus PDFs e imagens com o poder da inteligência artificial. Rápido, seguro e gratuito.",
    keywords = "pdf, converter pdf, ocr, ai, inteligência artificial, editar pdf, comprimir pdf, jpg para pdf",
    image = "/og-image.jpg",
    url = "https://conectapdf.com"
}) => {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />
        </Helmet>
    );
};

export default Seo;
