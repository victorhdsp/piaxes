import { useState, useEffect } from "react";
import piaxes_alt from "../../piaxes_alt.js"

function PimgDev(props) {
    const [alt, setAlt] = useState(props.alt || piaxes_alt[props.src] || 'erro ao carregar alt');
    useEffect(() => {
        if (props.alt || piaxes_alt[props.src])
            return;

        fetch('http://localhost:4334/image-info', {
            method: 'POST',
            body: props.src,
        }).then(response => response.text())
            .then(data => setAlt(data));
    }, []);

    return <img {...props} alt={alt} />;
}

function PimgProd(props) {
    const typeImage = RegExp(/\.(jpe?g|png)$/);
    const webpSrc = props.src.replace(typeImage, '.webp');
    const avifSrc = props.src.replace(typeImage, '.avif');
    const alt = props.alt || piaxes_alt[props.src] || 'erro ao carregar alt';

    return (
        <picture>
            <source srcSet={webpSrc} type="image/webp" />
            <source srcSet={avifSrc} type="image/avif" />
            <img {...props} alt={alt} />
        </picture>
    );
}

function Pimg(props) {
    const isDevelopment = import.meta.env.MODE === 'development';
  
    return (
      <>
        {isDevelopment ? <PimgDev {...props}/> : <PimgProd {...props}/>}
      </>
    );
  }
  
  export default Pimg;