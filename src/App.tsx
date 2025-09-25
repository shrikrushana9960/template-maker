import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
  PDFViewer,
  Svg,
  Rect,
} from "@react-pdf/renderer";
import EditLayout from "./editLayout";
import PdfTemplateEditor from "./templateEditor";

type ItemTuple = [string, number, string];

interface ReportData {
  customerName: string;
  date: string;
  items: ItemTuple[];
  total: string;
}

interface ReportDocumentProps {
  data: ReportData;
}

// ✅ Styles
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: "Helvetica" },
  header: { fontSize: 20, marginBottom: 20, textAlign: "center" },
  section: { marginBottom: 15 },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: { flexDirection: "row" },
  tableCol: {
    width: "33.33%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  bold: { fontWeight: "bold" },
  chartContainer: { marginTop: 20 },
});

// ✅ PDF Document Component with Chart
const ReportDocument: React.FC<ReportDocumentProps> = ({ data }) => {
  const maxQty = Math.max(...data.items.map((i) => i[1]));
  const chartHeight = 100;
  const barWidth = 40;
  const gap = 20;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Page 1 - Report Summary</Text>
        <View style={styles.section}>
          <Text>Name: {data.customerName}</Text>
          <Text>Date: {data.date}</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Page 2 - Items Table & Chart</Text>

        {data.items.map((item, idx) => (
          <Text key={idx}>
            {item[0]} - {item[1]} pcs - {item[2]}
          </Text>
        ))}

        {/* Simple Bar Chart */}
        <View style={styles.chartContainer}>
          <Svg
            width={data.items.length * (barWidth + gap)}
            height={chartHeight}
          >
            {data.items.map((item, idx) => (
              <Rect
                key={idx}
                x={idx * (barWidth + gap)}
                y={chartHeight - (item[1] / maxQty) * chartHeight}
                width={barWidth}
                height={(item[1] / maxQty) * chartHeight}
                fill="#4CAF50"
              />
            ))}
          </Svg>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Page 3 - Footer</Text>
        <Text>Total Amount: {data.total}</Text>
        <Text>Thank you for your business!</Text>
      </Page>
    </Document>
  );
};


const ReportPDFViewer: React.FC = () => {
  const reportData: ReportData = {
    customerName: "John Doe",
    date: "2025-09-23",
    items: [
      ["Apple", 2, "$5"],
      ["Banana", 5, "$3"],
      ["Mango", 1, "$2"],
    ],
    total: "$10",
  };

  return (
    <div style={{ height: "100vh" }}>
      {/* <PDFViewer width="100%" height="90%">
        <ReportDocument data={reportData} />
      </PDFViewer>

      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <PDFDownloadLink
          document={<ReportDocument data={reportData} />}
          fileName="report.pdf"
        >
          {({ loading }) => (loading ? "Generating PDF..." : "Download PDF")}
        </PDFDownloadLink>
      </div> */}
      {/* <EditLayout/> */}
      <PdfTemplateEditor/>
    </div>
  );
};

export default ReportPDFViewer;
