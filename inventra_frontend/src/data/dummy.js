// export const medicines = [
//   { id: 'MED-001', name: 'Paracetamol 500mg', category: 'Analgesics', batch: 'PCM-2025-A', supplier: 'MedSupply Co.', stock: 20, reorderLevel: 100, expiry: '2027-03-12', status: 'critical', price: 2.5 },
//   { id: 'MED-002', name: 'Amoxicillin 250mg', category: 'Antibiotics', batch: 'AMX-2024-C', supplier: 'PharmaLink', stock: 145, reorderLevel: 200, expiry: '2026-06-24', status: 'low', price: 8.0 },
//   { id: 'MED-003', name: 'Cetirizine 10mg', category: 'Antihistamines', batch: 'CTZ-2025-B', supplier: 'MedSupply Co.', stock: 380, reorderLevel: 80, expiry: '2028-01-08', status: 'healthy', price: 3.5 },
//   { id: 'MED-004', name: 'Insulin Glargine 100U', category: 'Diabetes', batch: 'INS-2025-D', supplier: 'BioMed India', stock: 8, reorderLevel: 50, expiry: '2026-12-30', status: 'critical', price: 42.0 },
//   { id: 'MED-005', name: 'Vitamin C 500mg', category: 'Vitamins', batch: 'VTC-2024-A', supplier: 'NutriPharma', stock: 42, reorderLevel: 80, expiry: '2027-09-15', status: 'low', price: 1.8 },
//   { id: 'MED-006', name: 'Metformin 500mg', category: 'Diabetes', batch: 'MET-2025-C', supplier: 'BioMed India', stock: 520, reorderLevel: 150, expiry: '2028-05-20', status: 'healthy', price: 4.2 },
//   { id: 'MED-007', name: 'Omeprazole 20mg', category: 'Gastroenterology', batch: 'OMP-2025-B', supplier: 'PharmaLink', stock: 210, reorderLevel: 100, expiry: '2027-11-04', status: 'healthy', price: 5.5 },
//   { id: 'MED-008', name: 'Atorvastatin 10mg', category: 'Cardiovascular', batch: 'ATV-2023-A', supplier: 'CardioMed', stock: 0, reorderLevel: 80, expiry: '2025-12-01', status: 'expired', price: 7.2 },
//   { id: 'MED-009', name: 'Azithromycin 500mg', category: 'Antibiotics', batch: 'AZM-2024-B', supplier: 'PharmaLink', stock: 60, reorderLevel: 100, expiry: '2026-06-30', status: 'low', price: 12.0 },
//   { id: 'MED-010', name: 'Vitamin D3 1000IU', category: 'Vitamins', batch: 'VTD-2025-A', supplier: 'NutriPharma', stock: 320, reorderLevel: 100, expiry: '2027-09-02', status: 'healthy', price: 2.2 },
//   { id: 'MED-011', name: 'Lisinopril 5mg', category: 'Cardiovascular', batch: 'LSN-2025-A', supplier: 'CardioMed', stock: 180, reorderLevel: 120, expiry: '2028-03-15', status: 'healthy', price: 6.8 },
//   { id: 'MED-012', name: 'Ranitidine 150mg', category: 'Gastroenterology', batch: 'RNT-2025-C', supplier: 'PharmaLink', stock: 55, reorderLevel: 80, expiry: '2026-08-05', status: 'low', price: 3.9 },
//   { id: 'MED-013', name: 'Aspirin 75mg', category: 'Cardiovascular', batch: 'ASP-2025-B', supplier: 'CardioMed', stock: 12, reorderLevel: 100, expiry: '2027-06-18', status: 'critical', price: 1.5 },
//   { id: 'MED-014', name: 'Dexamethasone 0.5mg', category: 'Steroids', batch: 'DEX-2025-A', supplier: 'BioMed India', stock: 18, reorderLevel: 60, expiry: '2027-02-10', status: 'critical', price: 9.5 },
//   { id: 'MED-015', name: 'Cough Syrup 100ml', category: 'Respiratory', batch: 'CSY-2025-A', supplier: 'MedSupply Co.', stock: 88, reorderLevel: 100, expiry: '2026-07-18', status: 'low', price: 4.0 },
// ];

// export const salesData = [
//   { month: 'Jan', sales: 220000, forecast: 215000 },
//   { month: 'Feb', sales: 280000, forecast: 270000 },
//   { month: 'Mar', sales: 310000, forecast: 305000 },
//   { month: 'Apr', sales: 260000, forecast: 275000 },
//   { month: 'May', sales: 340000, forecast: 330000 },
//   { month: 'Jun', sales: 380000, forecast: 370000 },
//   { month: 'Jul', sales: null, forecast: 420000 },
//   { month: 'Aug', sales: null, forecast: 460000 },
//   { month: 'Sep', sales: null, forecast: 440000 },
//   { month: 'Oct', sales: null, forecast: 490000 },
//   { month: 'Nov', sales: null, forecast: 510000 },
//   { month: 'Dec', sales: null, forecast: 480000 },
// ];

// export const categoryDemand = [
//   { category: 'Analgesics', demand: 4200, color: '#3b82f6' },
//   { category: 'Antibiotics', demand: 3800, color: '#10b981' },
//   { category: 'Vitamins', demand: 3100, color: '#f59e0b' },
//   { category: 'Diabetes', demand: 2800, color: '#8b5cf6' },
//   { category: 'Cardiovascular', demand: 2400, color: '#ef4444' },
//   { category: 'Gastro', demand: 1900, color: '#06b6d4' },
// ];

// export const inventoryHealth = [
//   { name: 'Healthy', value: 193, color: '#22c55e' },
//   { name: 'Low Stock', value: 57, color: '#f59e0b' },
//   { name: 'Critical', value: 28, color: '#ef4444' },
//   { name: 'Expired', value: 6, color: '#6b7280' },
// ];

// export const expiryData = [
//   { range: '< 30 days', count: 9, color: '#ef4444' },
//   { range: '30–60 days', count: 14, color: '#f59e0b' },
//   { range: '60–90 days', count: 21, color: '#3b82f6' },
//   { range: '> 90 days', count: 240, color: '#22c55e' },
// ];

// export const restockItems = [
//   { medicine: 'Paracetamol 500mg', stock: 20, predicted: 401, suggested: 500, supplier: 'MedSupply Co.', leadTime: '3 days', priority: 'critical' },
//   { medicine: 'Insulin Glargine', stock: 8, predicted: 95, suggested: 150, supplier: 'BioMed India', leadTime: '5 days', priority: 'critical' },
//   { medicine: 'Aspirin 75mg', stock: 12, predicted: 120, suggested: 200, supplier: 'CardioMed', leadTime: '4 days', priority: 'critical' },
//   { medicine: 'Cetirizine 10mg', stock: 380, predicted: 295, suggested: 200, supplier: 'MedSupply Co.', leadTime: '3 days', priority: 'high' },
//   { medicine: 'Vitamin C 500mg', stock: 42, predicted: 140, suggested: 300, supplier: 'NutriPharma', leadTime: '4 days', priority: 'high' },
//   { medicine: 'Amoxicillin 250mg', stock: 145, predicted: 130, suggested: 100, supplier: 'PharmaLink', leadTime: '2 days', priority: 'medium' },
//   { medicine: 'Cough Syrup 100ml', stock: 88, predicted: 110, suggested: 120, supplier: 'MedSupply Co.', leadTime: '3 days', priority: 'medium' },
//   { medicine: 'Omeprazole 20mg', stock: 210, predicted: 90, suggested: 50, supplier: 'PharmaLink', leadTime: '2 days', priority: 'low' },
// ];

// export const expiryItems = [
//   { medicine: 'Amoxicillin 250mg', batch: 'AMX-2024-C', expiry: '2026-06-24', daysLeft: 15, risk: 'high', stock: 145 },
//   { medicine: 'Azithromycin 500mg', batch: 'AZM-2024-B', expiry: '2026-06-30', daysLeft: 21, risk: 'high', stock: 60 },
//   { medicine: 'Cough Syrup 100ml', batch: 'CSY-2025-A', expiry: '2026-07-18', daysLeft: 39, risk: 'medium', stock: 88 },
//   { medicine: 'Ranitidine 150mg', batch: 'RNT-2025-C', expiry: '2026-08-05', daysLeft: 57, risk: 'medium', stock: 200 },
//   { medicine: 'Vitamin D3 1000IU', batch: 'VTD-2025-A', expiry: '2026-09-02', daysLeft: 85, risk: 'low', stock: 320 },
// ];

// export const suppliers = [
//   { id: 'SUP-001', name: 'MedSupply Co.', contact: 'contact@medsupply.in', city: 'Mumbai', leadTime: '3 days', reliability: 96, medicines: 42, totalPurchases: 842000 },
//   { id: 'SUP-002', name: 'PharmaLink', contact: 'orders@pharmalink.co.in', city: 'Pune', leadTime: '2 days', reliability: 91, medicines: 28, totalPurchases: 620000 },
//   { id: 'SUP-003', name: 'BioMed India', contact: 'procurement@biomed.in', city: 'Hyderabad', leadTime: '5 days', reliability: 88, medicines: 19, totalPurchases: 410000 },
//   { id: 'SUP-004', name: 'NutriPharma', contact: 'supply@nutripharma.in', city: 'Delhi', leadTime: '4 days', reliability: 84, medicines: 14, totalPurchases: 230000 },
//   { id: 'SUP-005', name: 'CardioMed', contact: 'info@cardiomed.in', city: 'Chennai', leadTime: '4 days', reliability: 89, medicines: 11, totalPurchases: 380000 },
// ];

// export const alerts = [
//   { id: 1, type: 'critical', title: 'Critical Stock: Paracetamol 500mg', desc: 'Only 20 units remaining. Minimum threshold: 100 units.', time: '2 min ago', read: false },
//   { id: 2, type: 'critical', title: 'Critical Stock: Insulin Glargine', desc: 'Only 8 units remaining. Immediate reorder required.', time: '15 min ago', read: false },
//   { id: 3, type: 'expiry', title: 'Expiry Alert: Amoxicillin 250mg', desc: 'Expires in 15 days — Batch AMX-2024-C. 145 units at risk.', time: '1 hr ago', read: false },
//   { id: 4, type: 'low', title: 'Low Stock: Vitamin C 500mg', desc: '42 units remaining. Reorder point: 80 units.', time: '3 hr ago', read: true },
//   { id: 5, type: 'expiry', title: 'Expiry Alert: Azithromycin 500mg', desc: 'Expires in 21 days — Batch AZM-2024-B.', time: '5 hr ago', read: true },
//   { id: 6, type: 'forecast', title: 'Demand Surge: Cetirizine 10mg', desc: 'AI predicts 40% demand increase in July due to monsoon.', time: '1 day ago', read: true },
//   { id: 7, type: 'restock', title: 'Restock Recommended: Paracetamol', desc: 'AI suggests ordering 500 units from MedSupply Co.', time: '1 day ago', read: true },
// ];

// export const forecastMedicines = [
//   { name: 'Paracetamol 500mg', current: 320, predicted: 401, confidence: 94, trend: 'up', growth: '+25%' },
//   { name: 'Cetirizine 10mg', current: 210, predicted: 295, confidence: 88, trend: 'up', growth: '+40%' },
//   { name: 'Metformin 500mg', current: 180, predicted: 175, confidence: 92, trend: 'stable', growth: '-3%' },
//   { name: 'Amoxicillin 250mg', current: 160, predicted: 130, confidence: 85, trend: 'down', growth: '-19%' },
//   { name: 'Vitamin C 500mg', current: 140, predicted: 190, confidence: 90, trend: 'up', growth: '+36%' },
//   { name: 'Omeprazole 20mg', current: 95, predicted: 98, confidence: 91, trend: 'stable', growth: '+3%' },
// ];

export const chatResponses = {
  reorder: { q: 'Which medicines need reordering?', a: `Based on current inventory levels and AI demand predictions, the following medicines need immediate reordering:\n\n**Critical Priority**\n• Paracetamol 500mg — 20 units left (order 500 units)\n• Insulin Glargine — 8 units left (order 150 units)\n• Aspirin 75mg — 12 units left (order 200 units)\n\n**High Priority**\n• Vitamin C 500mg — 42 units (order 300 units)\n• Azithromycin 500mg — 60 units (order 150 units)\n\nEstimated total reorder cost: ₹2.8L. Recommended supplier: MedSupply Co. for best lead time.` },
  expiry: { q: 'What medicines will expire this month?', a: `2 medicines are expiring within the next 30 days:\n\n**High Risk**\n• **Amoxicillin 250mg** — Expires June 24, 2026 (15 days)\n  Batch: AMX-2024-C | Stock: 145 units\n  Potential loss: ₹11,600\n\n• **Azithromycin 500mg** — Expires June 30, 2026 (21 days)\n  Batch: AZM-2024-B | Stock: 60 units\n  Potential loss: ₹7,200\n\nRecommendation: Consider applying a 15–20% discount to accelerate sales and reduce waste.` },
  critical: { q: 'Show critical stock medicines.', a: `Current critical stock medicines (below minimum threshold):\n\n| Medicine | Stock | Min. Threshold |\n|---|---|---|\n| Paracetamol 500mg | 20 | 100 |\n| Insulin Glargine | 8 | 50 |\n| Aspirin 75mg | 12 | 100 |\n| Dexamethasone 0.5mg | 18 | 60 |\n\nTotal critical items: **4 medicines**\nEstimated reorder cost: ₹1.4L\n\nAI has auto-generated reorder suggestions for all critical items.` },
  paracetamol: { q: 'Predict demand for Paracetamol.', a: `**Demand Forecast: Paracetamol 500mg**\n\nForecast Summary (July 2026)\n• Current monthly demand: 320 units\n• Predicted July demand: **401 units** (+25%)\n• Forecast confidence: **94%**\n\nTrend Analysis\n• Monsoon season historically increases demand by 20–35%\n• Fever and flu cases peak July–September\n• 3-month moving average: 290 units/month\n\nRecommendation\nOrder **500 units** from MedSupply Co. to cover 1.5 months demand buffer.\nLead time: 3 days | Unit cost: ₹2.50` },
};
