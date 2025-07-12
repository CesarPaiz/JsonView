import React, { useRef, useState } from "react";

// --- Iconos para la UI ---
const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-10 h-10 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);
const DocIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6 text-indigo-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

// Función para validar la estructura básica del DTE
const validateDTEStructure = (data) => {
  const hasIdentificacion =
    typeof data.identificacion === "object" && data.identificacion !== null;
  const hasEmisor = typeof data.emisor === "object" && data.emisor !== null;
  const hasReceptor =
    typeof data.receptor === "object" && data.receptor !== null;
  const hasCuerpoDocumento = Array.isArray(data.cuerpoDocumento);
  const hasResumen = typeof data.resumen === "object" && data.resumen !== null;

  return (
    hasIdentificacion &&
    hasEmisor &&
    hasReceptor &&
    hasCuerpoDocumento &&
    hasResumen
  );
};

export default function JsonUploader() {
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [jsonData, setJsonData] = useState(null);

  const resetState = () => {
    setError(null);
    setJsonData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processFile = async (file) => {
    if (!file) return;
    resetState();

    if (!file.name.endsWith(".json")) {
      setError("El archivo debe tener la extensión .json");
      return;
    }

    try {
      const text = await file.text();
      const parsedJson = JSON.parse(text);

      if (!validateDTEStructure(parsedJson)) {
        setError("El archivo no tiene la estructura de un DTE válido.");
        return;
      }

      setJsonData({ content: parsedJson });
    } catch {
      setError("El archivo seleccionado no es un JSON válido.");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jsonData || error) {
      setError("Por favor, carga un archivo JSON válido para continuar.");
      return;
    }
    try {
      const text = JSON.stringify(jsonData.content);
      const encoded = encodeURIComponent(text);
      window.location.href = `/nuevo/subir?r=${encoded}`;
    } catch {
      setError("El archivo JSON no pudo ser procesado.");
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
      <div className="w-full max-w-xl">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-lg space-y-6"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">
              Cargar Documento Electrónico
            </h2>
            <p className="text-gray-500 mt-2">
              Sube el archivo JSON de tu DTE para procesarlo.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-200 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!jsonData ? (
            <label
              htmlFor="file-upload"
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center w-full h-48 px-4 transition bg-white border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-blue-400 focus:outline-none ${isDragging ? "border-blue-500" : "border-gray-300"}`}
            >
              <UploadIcon />
              <span className="flex items-center space-x-2 mt-2">
                <span className="font-medium text-gray-600">
                  Arrastra tu archivo o{" "}
                  <span className="text-blue-600 underline">haz clic aquí</span>
                </span>
              </span>
              <input
                id="file-upload"
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="p-5 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <DocIcon />
                  <h4 className="font-bold text-gray-800 text-lg">
                    Resumen del Documento
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={resetState}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Cambiar archivo
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-gray-500">Emisor</p>
                  <p className="font-semibold text-gray-800">
                    {jsonData.content.emisor?.nombre || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-gray-500">Receptor</p>
                  <p className="font-semibold text-gray-800">
                    {jsonData.content.receptor?.nombre || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-gray-500">
                    Detalle ({jsonData.content.cuerpoDocumento?.length || 0}{" "}
                    items)
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mt-1 pl-2">
                    {jsonData.content.cuerpoDocumento
                      ?.slice(0, 3)
                      .map((item) => (
                        <li key={item.numItem}>{item.descripcion}</li>
                      ))}
                    {jsonData.content.cuerpoDocumento?.length > 3 && (
                      <li>...y más</li>
                    )}
                  </ul>
                </div>

                {/* --- SECCIÓN DEL TOTAL MODIFICADA --- */}
                <div className="flex justify-end pt-2">
                  <div className="w-full md:w-2/3 lg:w-1/2 p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-gray-600">Total</span>
                      <span className="font-bold text-xl text-gray-800">
                        $
                        {parseFloat(
                          jsonData.content.resumen?.totalPagar || 0,
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={!jsonData || !!error}
              className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Cargar y Procesar Documento
            </button>
            <a
              href="/"
              className="block w-full text-center px-4 py-3 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Volver al Inicio
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
