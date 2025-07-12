import React, { useRef, useState } from "react";

export default function JsonUploader() {
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);

  const handleFileChange = async () => {
    setError(null);
    setFileName(null);

    if (!fileInputRef.current.files.length) {
      return;
    }

    const file = fileInputRef.current.files[0];
    setFileName(file.name);

    try {
      const text = await file.text();
      JSON.parse(text); // validar JSON
    } catch {
      setError("Archivo JSON inválido.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!fileInputRef.current.files.length) {
      setError("Selecciona un archivo JSON.");
      return;
    }

    const file = fileInputRef.current.files[0];
    try {
      const text = await file.text();
      // Validar JSON
      JSON.parse(text);
      // Codificar y redirigir con el JSON en la URL
      const encoded = encodeURIComponent(text);
      window.location.href = `/nuevo/subir?data=${encoded}`;
    } catch {
      setError("El archivo JSON no es válido.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-4"
    >
      <h2 className="text-center text-2xl font-bold">Subir archivo JSON</h2>

      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="block w-full border p-2 rounded"
      />

      {fileName && (
        <p className="text-sm text-gray-600">
          Archivo seleccionado: {fileName}
        </p>
      )}
      {error && <p className="text-red-600">{error}</p>}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
      >
        Cargar JSON
      </button>
    </form>
  );
}
