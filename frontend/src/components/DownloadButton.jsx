export default function DownloadButton({ document, onDownload }) {
  return (
    <button className="download-button" type="button" onClick={() => onDownload(document)}>
      Baixar
    </button>
  );
}