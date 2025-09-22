import React from "react";
import { Call, MailOutline, Person } from "@mui/icons-material";
import { TABLE_FIELD_TYPES, getFieldType } from "../../config/tableConfig";

const formatValue = (value) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date) return value.toLocaleDateString();

  // ISO date strings
  const isoDateRegex =
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;
  if (typeof value === "string" && isoDateRegex.test(value)) {
    const parsed = new Date(value);
    if (!isNaN(parsed)) return parsed.toLocaleDateString();
  }

  if (typeof value === "object") return JSON.stringify(value);
  return String(value).trim();
};

const formatDisplayValue = (field, toDisplayValue, setPreviewImage = null) => {
  const raw = toDisplayValue;
  const value = formatValue(toDisplayValue);
  let background = "";
  const type = getFieldType(field);

  switch (type) {
    case TABLE_FIELD_TYPES.IMAGE: {
      // allow absolute URLs or server-relative paths
      if (
        typeof raw === "string" &&
        (raw.startsWith("http") || raw.startsWith("/"))
      ) {
        const src = raw.startsWith("http")
          ? raw
          : `${window.location.origin}${raw}`;
        return (
          <img
            src={src}
            alt={field}
            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 4,
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
            onClick={() => setPreviewImage && setPreviewImage(src)}
          />
        );
      }
      return <span>-</span>;
    }

    case TABLE_FIELD_TYPES.EMAIL:
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <MailOutline style={{ fontSize: 16, marginRight: 4, color: "#666" }} />
          <span style={{ fontFamily: "monospace", fontSize: 14 }}>{value}</span>
        </div>
      );

    case TABLE_FIELD_TYPES.PHONE:
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Call style={{ fontSize: 16, marginRight: 4, color: "#666" }} />
          <span style={{ fontSize: 14 }}>{value}</span>
        </div>
      );

    case TABLE_FIELD_TYPES.NUMBER:
      if (field === "donation_amount" || field === "price") {
        const amt = parseFloat(value) || 0;
        return (
          <span
            style={{
              backgroundColor: "#e6ffed",
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            ₱{amt.toFixed(2)}
          </span>
        );
      }
      if (field === "booking_pax") {
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Person
              style={{ fontSize: 16, marginRight: 4, color: "#666" }}
            />
            <span style={{ fontSize: 14 }}>{value}</span>
          </div>
        );
      }
      return value;

    case TABLE_FIELD_TYPES.SELECT:
      if (field === "booking_status") {
        if (value === "pending") background = "#fff4e5";
        else if (value === "approved") background = "#e6ffed";
        else if (value === "rejected") background = "#ffe6e6";
        else background = "#f0f0f0";
        return (
          <span
            style={{
              backgroundColor: background,
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            {value}
          </span>
        );
      }
      if (field === "gender" || field === "user_gender") {
        let display = "Not Specified";
        if (/^m/i.test(value)) {
          display = "Male";
          background = "#e8f0fe";
        } else if (/^f/i.test(value)) {
          display = "Female";
          background = "#ffe6f2";
        } else {
          background = "#f0f0f0";
        }
        return (
          <span
            style={{
              backgroundColor: background,
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            {display}
          </span>
        );
      }
      if (field === "priest_availability") {
        background = value === "Yes" ? "#e6ffed" : "#ffe6e6";
        return (
          <span
            style={{
              backgroundColor: background,
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            {value}
          </span>
        );
      }
      return value;

    default:
      if (field === "document_id" || field === "booking_transaction") {
        return (
          <span
            style={{
              backgroundColor: "#f5f5f5",
              padding: "2px 6px",
              borderRadius: 4,
              fontFamily: "monospace",
              fontSize: 12,
            }}
          >
            {value}
          </span>
        );
      }
      return value;
  }
};

export { formatValue, formatDisplayValue };