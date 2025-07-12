import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ListaDeComprasInteractiva({ compras }) {
  const [cliente, setCliente] = useState("");
  const [dte, setDte] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [itemBusqueda, setItemBusqueda] = useState("");

  const limpiarFiltros = () => {
    setCliente("");
    setDte("");
    setFechaDesde("");
    setFechaHasta("");
    setItemBusqueda("");
  };

  const comprasFiltradas = compras.filter((compra) => {
    const matchFecha =
      (!fechaDesde || compra.fecEmi >= fechaDesde) &&
      (!fechaHasta || compra.fecEmi <= fechaHasta);

    const matchCliente =
      cliente === "" ||
      compra.receptor_nombre.toLowerCase().includes(cliente.toLowerCase());

    const matchDte =
      dte === "" ||
      compra.numeroControl.toLowerCase().includes(dte.toLowerCase());

    const matchItem =
      itemBusqueda === "" ||
      (Array.isArray(compra.cuerpoDocumento_json) &&
        compra.cuerpoDocumento_json.some((item) =>
          item.descripcion?.toLowerCase().includes(itemBusqueda.toLowerCase()),
        ));

    return matchCliente && matchDte && matchFecha && matchItem;
  });

  const generarPDF = () => {
    if (comprasFiltradas.length === 0) {
      alert("No hay resultados para exportar.");
      return;
    }
    const doc = new jsPDF({ orientation: "landscape" });
    const parametrosBusqueda = [];
    if (cliente) parametrosBusqueda.push(`Cliente: ${cliente}`);
    if (dte) parametrosBusqueda.push(`DTE: ${dte}`);
    if (itemBusqueda) parametrosBusqueda.push(`Producto: ${itemBusqueda}`);
    if (fechaDesde) {
      const fechaFormateada = new Date(
        fechaDesde + "T00:00:00-06:00",
      ).toLocaleDateString("es-SV");
      parametrosBusqueda.push(`Desde: ${fechaFormateada}`);
    }
    if (fechaHasta) {
      const fechaFormateada = new Date(
        fechaHasta + "T00:00:00-06:00",
      ).toLocaleDateString("es-SV");
      parametrosBusqueda.push(`Hasta: ${fechaFormateada}`);
    }
    const columnas = ["# DTE", "Cliente", "Emisor", "Fecha", "Total Pagado"];
    const filas = comprasFiltradas.map((compra) => [
      compra.numeroControl,
      compra.receptor_nombre,
      compra.emisor_nombre,
      compra.fecEmi,
      `$${parseFloat(compra.totalPagar).toFixed(2)}`,
    ]);
    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 52,
      theme: "striped",
      headStyles: {
        fillColor: [29, 78, 216],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        textColor: [40, 40, 40],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      didDrawPage: (data) => {
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text(
          "Reporte de Compras",
          doc.internal.pageSize.getWidth() / 2,
          20,
          { align: "center" },
        );
        doc.setLineWidth(0.5);
        doc.line(14, 23, doc.internal.pageSize.getWidth() - 14, 23);
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Página ${doc.internal.getCurrentPageInfo().pageNumber} de ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" },
        );
      },
      margin: { top: 30 },
    });
    let startY = 32;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Filtros Aplicados:", 14, startY);
    startY += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    if (parametrosBusqueda.length > 0) {
      parametrosBusqueda.forEach((param) => {
        doc.text(`- ${param}`, 16, startY);
        startY += 5;
      });
    } else {
      doc.text("- Ninguno", 16, startY);
    }
    doc.save(`Reporte_Compras_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 -12 md:p-6">
      {/* --- Encabezado y Botón Agregar --- */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Listado de Compras
        </h1>
        <a
          href="/nuevo"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <span className="text-lg mr-2">＋</span>
          Agregar Nuevo
        </a>
      </div>

      <div className="bg-white p-4 mb-6 border rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">
          Filtros de Búsqueda
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="cliente"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Cliente
            </label>
            <input
              type="text"
              id="cliente"
              placeholder="Nombre del cliente..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="dte"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              No. de DTE
            </label>
            <input
              type="text"
              id="dte"
              placeholder="Número de control..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={dte}
              onChange={(e) => setDte(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="itemBusqueda"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Producto
            </label>
            <input
              type="text"
              id="itemBusqueda"
              placeholder="Descripción del producto..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={itemBusqueda}
              onChange={(e) => setItemBusqueda(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="fechaDesde"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Desde
            </label>
            <input
              type="date"
              id="fechaDesde"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="fechaHasta"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Hasta
            </label>
            <input
              type="date"
              id="fechaHasta"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 justify-end">
          <button
            onClick={limpiarFiltros}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Limpiar Filtros
          </button>
          <button
            onClick={generarPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={comprasFiltradas.length === 0}
          >
            🖨️ Exportar a PDF
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {comprasFiltradas.length > 0 ? (
          comprasFiltradas.map((compra) => (
            <a
              key={compra.numeroControl}
              href={`/view?r=${compra.codigoGeneracion}`}
              className="block text-current no-underline transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
            >
              <div className="bg-white p-5 rounded-lg border shadow-md">
                <div className="flex flex-wrap justify-between items-center">
                  <div className="mb-2 md:mb-0">
                    <p className="text-lg font-bold text-gray-800">
                      {compra.receptor_nombre}
                    </p>
                    <p className="text-sm text-gray-500">
                      {compra.numeroControl}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-semibold text-blue-600">
                      ${parseFloat(compra.totalPagar).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Emitido: {compra.fecEmi}
                    </p>
                  </div>
                </div>
              </div>
            </a>
          ))
        ) : (
          <p className="text-center text-gray-500 py-10">
            No se encontraron resultados para los filtros aplicados.
          </p>
        )}
      </div>
    </div>
  );
}
