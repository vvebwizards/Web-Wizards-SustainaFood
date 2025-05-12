import jsPDF from "jspdf";
import { Order, OrderItem, OrderStatus } from "../types/";
import "jspdf-autotable";

// Add the missing type for jsPDF-autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Colors matching your UI
const COLORS = {
  primary: "#9333ea", // Purple
  primaryLight: "#d8b4fe",
  text: "#1f2937",
  lightText: "#6b7280",
  success: "#16a34a",
  warning: "#f59e0b",
  error: "#dc2626",
  lightGray: "#f3f4f6",
  mediumGray: "#e5e7eb",
  white: "#ffffff",
};

// Helper function to determine color based on status
const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case "delivered":
      return COLORS.success;
    case "cancelled":
      return COLORS.error;
    case "processing":
    case "packed":
    case "shipped":
      return COLORS.primary;
    default:
      return COLORS.lightText;
  }
};

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Add logo to PDF
const addLogo = (doc: jsPDF): void => {
  // Company name as text logo (replace with image logo if available)
  doc.setFontSize(24);
  doc.setTextColor(COLORS.primary);
  doc.setFont("helvetica", "bold");
  doc.text("SustainaFood", 20, 20);
  
  // Add a decorative line under the logo
  doc.setDrawColor(COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(20, 22, 80, 22);
};

// Add order header information
const addOrderHeader = (doc: jsPDF, order: Order): void => {
  // Right aligned order number and date
  doc.setFontSize(12);
  doc.setTextColor(COLORS.text);
  doc.setFont("helvetica", "normal");
  
  // Add order info box
  doc.setFillColor(COLORS.lightGray);
  doc.roundedRect(125, 15, 70, 30, 3, 3, "F");
  
  doc.setFont("helvetica", "bold");
  doc.text("ORDER DETAILS", 130, 25);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Order #: ${order.orderNumber}`, 130, 32);
  doc.text(`Date: ${formatDate(order.createdAt)}`, 130, 38);
  
  // Add status badge
  const statusText = order.status.toUpperCase();
  const statusColor = getStatusColor(order.status);
  doc.setFillColor(statusColor);
  doc.setTextColor(COLORS.white);
  doc.roundedRect(20, 30, 60, 10, 2, 2, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(statusText, 50, 36.5, { align: "center" });
};

// Add customer and shipping information
const addCustomerInfo = (doc: jsPDF, order: Order): void => {
  const startY = 55;
  const colWidth = 90;
  
  // Section headers
  doc.setFillColor(COLORS.mediumGray);
  doc.rect(20, startY, colWidth, 10, "F");
  doc.rect(colWidth + 25, startY, colWidth, 10, "F");
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.text);
  doc.text("CUSTOMER INFORMATION", 20 + 5, startY + 7);
  doc.text("SHIPPING ADDRESS", colWidth + 25 + 5, startY + 7);
  
  // Customer info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  let y = startY + 20;
  
  doc.text(`Name: ${order.customer.name}`, 25, y);
  y += 7;
  doc.text(`Email: ${order.customer.email}`, 25, y);
  y += 7;
  if (order.customer.phone) {
    doc.text(`Phone: ${order.customer.phone}`, 25, y);
  }
  
  // Shipping address
  y = startY + 20;
  doc.text(order.shippingAddress.street, colWidth + 30, y);
  y += 7;
  doc.text(
    `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`,
    colWidth + 30,
    y
  );
  y += 7;
  doc.text(order.shippingAddress.country, colWidth + 30, y);
  
  // Delivery information if available
  if (order.delivery?.estimatedDelivery) {
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.text("Estimated Delivery:", colWidth + 30, y);
    doc.setFont("helvetica", "normal");
    y += 7;
    doc.text(formatDate(order.delivery.estimatedDelivery), colWidth + 30, y);
  }
  
  // Tracking number if available
  if (order.trackingNumber) {
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.text("Tracking Number:", colWidth + 30, y);
    doc.setFont("helvetica", "normal");
    y += 7;
    doc.text(order.trackingNumber, colWidth + 30, y);
  }
  
  // Add a divider line
  const dividerY = Math.max(y + 15, startY + 70);
  doc.setDrawColor(COLORS.mediumGray);
  doc.setLineWidth(0.5);
  doc.line(20, dividerY, 190, dividerY);
  
  return dividerY;
};

// Add order timeline visualization
const addOrderTimeline = (doc: jsPDF, order: Order, startY: number): number => {
  const statusSteps = ["pending", "processing", "packed", "shipped", "delivered"];
  const currentStep = statusSteps.indexOf(order.status);
  
  // Section header
  doc.setFillColor(COLORS.mediumGray);
  doc.rect(20, startY + 10, 170, 10, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.text);
  doc.text("ORDER TIMELINE", 25, startY + 17);
  
  // Timeline
  const timelineY = startY + 35;
  const stepWidth = 150 / (statusSteps.length - 1);
  
  // Draw timeline line
  doc.setDrawColor(COLORS.mediumGray);
  doc.setLineWidth(1);
  doc.line(25, timelineY, 175, timelineY);
  
  // Draw progress line
  if (currentStep >= 0) {
    const progressWidth = Math.min((currentStep / (statusSteps.length - 1)) * 150, 150);
    doc.setDrawColor(COLORS.primary);
    doc.setLineWidth(1);
    doc.line(25, timelineY, 25 + progressWidth, timelineY);
  }
  
  // Draw steps
  statusSteps.forEach((status, index) => {
    const x = 25 + (index * stepWidth);
    const isCompleted = currentStep >= index;
    const isCurrent = currentStep === index;
    
    // Draw circle
    if (isCompleted) {
      doc.setFillColor(COLORS.primary);
      doc.circle(x, timelineY, 4, "F");
    } else {
      doc.setFillColor(COLORS.white);
      doc.setDrawColor(COLORS.mediumGray);
      doc.circle(x, timelineY, 4, "FD");
    }
    
    // Add highlight for current step
    if (isCurrent) {
      doc.setDrawColor(COLORS.primary);
      doc.setLineWidth(0.5);
      doc.circle(x, timelineY, 6, "S");
    }
    
    // Add step label
    doc.setFontSize(8);
    const stepName = status.charAt(0).toUpperCase() + status.slice(1);
    if (isCompleted) {
      doc.setTextColor(COLORS.primary);
      doc.setFont("helvetica", "bold");
    } else {
      doc.setTextColor(COLORS.lightText);
      doc.setFont("helvetica", "normal");
    }
    doc.text(stepName, x, timelineY + 12, { align: "center" });
  });
  
  // Add a divider line
  const dividerY = timelineY + 20;
  doc.setDrawColor(COLORS.mediumGray);
  doc.setLineWidth(0.5);
  doc.line(20, dividerY, 190, dividerY);
  
  return dividerY;
};

// Add order items table
const addOrderItems = (doc: jsPDF, order: Order, startY: number): number => {
  // Add a bit of spacing
  startY += 10;
  
  // Section header
  doc.setFillColor(COLORS.mediumGray);
  doc.rect(20, startY, 170, 10, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.text);
  doc.text("ORDER ITEMS", 25, startY + 7);
  
  // Create items table
  const tableColumns = [
    { header: "Product", dataKey: "name" },
    { header: "SKU", dataKey: "sku" },
    { header: "Qty", dataKey: "qty" },
    { header: "Price", dataKey: "price" },
    { header: "Urgency", dataKey: "urgency" },
  ];
  
  const tableRows = order.items.map((item: OrderItem) => {
    return {
      name: item.name,
      sku: item.sku || "N/A",
      qty: item.orderedQuantity,
      price: formatCurrency(item.price),
      urgency: item.urgencyScore === 0 ? "Low" : item.urgencyScore === 1 ? "Medium" : "High",
    };
  });
  
  // Apply table styling
  const tableStyles = {
    headStyles: {
      fillColor: [147, 51, 234], // Purple
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [243, 244, 246], // Light gray
    },
    margin: { top: startY + 15 },
  };
  
  // Add the table
  doc.autoTable({
    columns: tableColumns,
    body: tableRows,
    ...tableStyles,
    didDrawPage: (data) => {
      // Footer for each page
      addFooter(doc);
    }
  });
  
  // Return the position after the table
  return doc.autoTable.previous.finalY + 10;
};

// Add order summary with totals
const addOrderSummary = (doc: jsPDF, order: Order, startY: number): number => {
  // Skip if we don't have pricing info
  if (!order.totalAmount) return startY;
  
  // Calculate total based on items if totalAmount is not directly available
  let totalAmount = order.totalAmount;
  if (!totalAmount && order.items && order.items.length > 0) {
    totalAmount = order.items.reduce((sum, item) => sum + (item.price * item.orderedQuantity), 0);
  }
  
  // Only draw summary if we have an amount
  if (totalAmount) {
    // Draw box for order summary
    doc.setDrawColor(COLORS.mediumGray);
    doc.setLineWidth(0.5);
    doc.setFillColor(COLORS.lightGray);
    doc.roundedRect(110, startY, 80, 40, 2, 2, "FD");
    
    // Add titles
    doc.setFontSize(10);
    doc.setTextColor(COLORS.text);
    doc.setFont("helvetica", "bold");
    doc.text("ORDER SUMMARY", 120, startY + 10);
    
    // Calculate values (we'll use placeholders if needed)
    const subtotal = totalAmount;
    const tax = 0; // Add this if available
    const shipping = 0; // Add this if available
    const total = subtotal + tax + shipping;
    
    // Add summary items
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", 120, startY + 20);
    doc.text(formatCurrency(subtotal), 180, startY + 20, { align: "right" });
    
    // Add tax and shipping if available
    if (tax > 0) {
      doc.text("Tax:", 120, startY + 27);
      doc.text(formatCurrency(tax), 180, startY + 27, { align: "right" });
    }
    
    if (shipping > 0) {
      doc.text("Shipping:", 120, startY + 34);
      doc.text(formatCurrency(shipping), 180, startY + 34, { align: "right" });
    }
    
    // Add total
    doc.setDrawColor(COLORS.mediumGray);
    doc.setLineWidth(0.5);
    doc.line(120, startY + 37, 180, startY + 37);
    
    doc.setFont("helvetica", "bold");
    doc.text("Total:", 120, startY + 45);
    doc.text(formatCurrency(total), 180, startY + 45, { align: "right" });
    
    return startY + 50;
  }
  
  return startY;
};

// Add notes section if available
const addNotes = (doc: jsPDF, order: Order, startY: number): number => {
  if (order.delivery?.notes) {
    doc.setFontSize(10);
    doc.setTextColor(COLORS.text);
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 20, startY + 10);
    
    doc.setFont("helvetica", "normal");
    const notes = doc.splitTextToSize(order.delivery.notes, 170);
    doc.text(notes, 20, startY + 20);
    
    return startY + 20 + (notes.length * 5);
  }
  
  return startY;
};

// Add footer with page numbers and contact info
const addFooter = (doc: jsPDF): void => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Footer line
  doc.setDrawColor(COLORS.mediumGray);
  doc.setLineWidth(0.5);
  doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
  
  // Contact info
  doc.setFontSize(8);
  doc.setTextColor(COLORS.lightText);
  doc.setFont("helvetica", "normal");
  doc.text("sustainaFood | www.sustainaFood.com | support@sustainaFood.com | 1-800-123-4567", pageWidth / 2, pageHeight - 14, { align: "center" });
  
  // Page number
  doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 20, pageHeight - 10, { align: "right" });
  
  // Generated date
  const today = new Date().toLocaleDateString();
  doc.text(`Generated: ${today}`, 20, pageHeight - 10);
};

/**
 * Generate a professional PDF for an order
 */
export const generateOrderPDF = (order: Order): void => {
  // Initialize PDF with A4 size
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  
  // Add logo and header
  addLogo(doc);
  addOrderHeader(doc, order);
  
  // Add customer and shipping info
  const afterCustomerY = addCustomerInfo(doc, order);
  
  // Add order timeline
  const afterTimelineY = addOrderTimeline(doc, order, afterCustomerY);
  
  // Add order items table
  const afterItemsY = addOrderItems(doc, order, afterTimelineY);
  
  // Add order summary with totals
  const afterSummaryY = addOrderSummary(doc, order, afterItemsY);
  
  // Add notes if present
  addNotes(doc, order, afterSummaryY);
  
  // Add footer
  addFooter(doc);
  
  // Save the PDF
  doc.save(`order-${order.orderNumber}.pdf`);
};