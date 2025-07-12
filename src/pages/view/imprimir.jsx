import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Este componente recibe la información de la compra como prop
export default function ImprimirFactura({ compra }) {
  const generarPDFFactura = () => {
    const doc = new jsPDF();
    const items = JSON.parse(compra.cuerpoDocumento_json);

    // --- Encabezado del Documento ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Factura de Compra", 105, 20, { align: "center" });

    // --- Datos del Emisor y Receptor ---
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Emisor:", 14, 40);
    doc.setFont("helvetica", "normal");
    doc.text(compra.emisor_nombre, 14, 46);
    doc.text(`NIT: ${compra.emisor_nit}`, 14, 52);

    doc.setFont("helvetica", "bold");
    doc.text("Receptor:", 110, 40);
    doc.setFont("helvetica", "normal");
    doc.text(compra.receptor_nombre, 110, 46);
    doc.text(`Documento: ${compra.receptor_numDocumento}`, 110, 52);

    // --- Datos de la Factura ---
    doc.setFont("helvetica", "bold");
    doc.text("No. de Control:", 14, 65);
    doc.setFont("helvetica", "normal");
    doc.text(compra.numeroControl, 45, 65);

    doc.setFont("helvetica", "bold");
    doc.text("Fecha de Emisión:", 14, 71);
    doc.setFont("helvetica", "normal");
    doc.text(compra.fecEmi, 45, 71);

    // --- Tabla de Items ---
    const columnas = ["Descripción", "Cant.", "P. Unitario", "Subtotal"];
    const filas = items.map((item) => [
      item.descripcion,
      item.cantidad,
      `$${parseFloat(item.precioUni).toFixed(2)}`,
      `$${parseFloat(item.ventaGravada).toFixed(2)}`,
    ]);

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 85,
      theme: "grid",
      headStyles: { fillColor: [40, 40, 40] },
    });

    // --- Totales ---
    const finalY = doc.lastAutoTable.finalY || 150; // Posición después de la tabla
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Total a Pagar:", 150, finalY + 20, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`$${parseFloat(compra.totalPagar).toFixed(2)}`, 200, finalY + 20, {
      align: "right",
    });

    // --- Guardar PDF ---
    doc.save(`Factura_${compra.numeroControl}.pdf`);
  };

  return (
    <button
      onClick={generarPDFFactura}
      className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
    >
      Imprimir PDF
    </button>
  );
}
