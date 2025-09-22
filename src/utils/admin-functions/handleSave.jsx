import React, { useState, useMemo } from "react";
import { supabase } from "../../config/supabase";
import saveSpecificSacramentDocument from "../form-functions/saveSpecificSacramentDocument";
import saveWeddingDocument from "../form-functions/saveWeddingDocument";
import baptismFormValidation from "../form-validations/baptismFormValidation";
import burialFormValidation from "../form-validations/burialFormValidation";
import weddingFormValidation from "../form-validations/weddingFormValidation";
import generatePassword from "./generatePassword";
import { formatDisplayValue } from "../../utils/admin-functions/formatDatabaseValue";

// Helper: upload a file to certificates bucket and return the public URL
const uploadCertificateFile = async (file, field, docId) => {
  if (!file || typeof file === "string") return file;
  const ext = file.name.split(".").pop();
  const filename = `${field}_${docId ? docId : Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("certificates")
    .upload(filename, file, { upsert: true });
  if (error) throw new Error("File upload failed: " + error.message);
  const { data: publicUrl } = supabase.storage
    .from("certificates")
    .getPublicUrl(filename);
  return publicUrl?.publicUrl || "";
};

const handleSave = async ({
  TABLE_STRUCTURES,
  selectedTable,
  tableData,
  formData,
  editingRecord,
  adminData,
  setError,
  setSuccess,
  setOpenDialog,
  handleTableSelect,
  fetchStats,
}) => {
  try {
    // ==== USER VALIDATION (untouched) ====
    if (selectedTable === "user_tbl") {
      if (formData.user_email) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) {
          setError("Please enter a valid email address.");
          return false;
        }
      }
      if (formData.user_mobile) {
        if (!/^\d+$/.test(formData.user_mobile)) {
          setError("Mobile number must contain only numbers.");
          return false;
        }
        if (
          !formData.user_mobile.startsWith("09") ||
          formData.user_mobile.length !== 11
        ) {
          setError(
            "Mobile number must be 11 digits long and start with 09."
          );
          return false;
        }
      }
      if (formData.user_bday) {
        const today = new Date();
        const birthDate = new Date(formData.user_bday);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        if (
          age < 18 ||
          (age === 18 && monthDiff < 0) ||
          (age === 18 && monthDiff === 0 && dayDiff < 0)
        ) {
          setError(
            "The user must be at least 18 years old to join SagradaGo."
          );
          return false;
        }
      } else {
        setError("Please enter a valid birth date.");
        return false;
      }
      if (formData.user_gender) {
        if (formData.user_gender === "") {
          setError("Please select a gender");
          return false;
        }
      } else {
        setError("Please select a gender");
        return false;
      }
    }

    // ==== REQUIRED FIELDS CHECK (untouched) ====
    const requiredFields = TABLE_STRUCTURES[selectedTable].requiredFields;
    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    // ==== BOOKING TIME CONFLICT LOGIC (untouched) ====
    if (selectedTable === "booking_tbl") {
      const bookingDate = formData.booking_date;
      const bookingTime = formData.booking_time;
      if (bookingDate && bookingTime) {
        const { data: approvedBookings, error: conflictError } =
          await supabase
            .from("booking_tbl")
            .select("*")
            .eq("booking_date", bookingDate)
            .eq("booking_status", "approved");
        if (conflictError) {
          setError("Error checking for booking conflicts.");
          return;
        }
        const [h, m] = bookingTime.split(":");
        const bookingMinutes = parseInt(h, 10) * 60 + parseInt(m, 10);
        const hasConflict = approvedBookings.some((b) => {
          if (editingRecord && b.id === editingRecord) return false;
          const [bh, bm] = (b.booking_time || "").split(":");
          if (!bh || !bm) return false;
          const bMinutes = parseInt(bh, 10) * 60 + parseInt(bm, 10);
          return Math.abs(bMinutes - bookingMinutes) < 60;
        });
        if (hasConflict) {
          setError(
            "There is already an approved booking within 1 hour of the selected time. Please choose a different time."
          );
          return;
        }
      }
    }

    // ==== DOCUMENT CERTIFICATE FILE UPLOAD SUPPORT ====
    let updateData = { ...formData };
    let documentId = editingRecord;
    if (selectedTable === "document_tbl") {
      if (!documentId) {
        const { data: inserted, error } = await supabase
          .from("document_tbl")
          .insert([
            {
              ...formData,
              baptismal_certificate: null,
              confirmation_certificate: null,
              wedding_certificate: null,
            },
          ])
          .select();
        if (error) {
          setError("Could not create record for file upload.");
          return;
        }
        documentId = inserted[0].id;
        updateData = { ...inserted[0] };
      }
      for (const certField of [
        "baptismal_certificate",
        "confirmation_certificate",
        "wedding_certificate",
      ]) {
        if (updateData[certField] && updateData[certField] instanceof File) {
          const certUrl = await uploadCertificateFile(
            updateData[certField],
            certField,
            documentId
          );
          updateData[certField] = certUrl;
        } else if (
          updateData[certField] === null ||
          updateData[certField] === undefined ||
          updateData[certField] === ""
        ) {
          updateData[certField] = null;
        }
      }
    }

    // ===== CRUD LOGIC FOR ALL TABLES (untouched) =====
    if (editingRecord || (selectedTable === "document_tbl" && documentId)) {
      const updateId = editingRecord || documentId;
      if ("user_firstname" in updateData && selectedTable !== "user_tbl") {
        delete updateData.user_firstname;
      }
      if ("user_lastname" in updateData && selectedTable !== "user_tbl") {
        delete updateData.user_lastname;
      }
      if ("groom_fullname" in updateData) {
        delete updateData.groom_fullname;
      }
      if ("bride_fullname" in updateData) {
        delete updateData.bride_fullname;
      }
      if ("groom_1x1" in updateData) {
        delete updateData.groom_1x1;
      }
      if ("bride_1x1" in updateData) {
        delete updateData.bride_1x1;
      }

      const oldRecord = tableData.find((r) => r.id === updateId);
      const { error: updateError } = await supabase
        .from(selectedTable)
        .update(updateData)
        .eq("id", updateId);

      if (updateError) throw updateError;

      await supabase.from("transaction_logs").insert({
        table_name: selectedTable,
        action: "UPDATE",
        record_id: updateId,
        old_data: oldRecord,
        new_data: updateData,
        performed_by: adminData
          ? `${adminData.firstName} ${adminData.lastName}`
          : "Unknown",
        performed_by_email: adminData?.email || "Unknown",
      });
      setSuccess("Record updated successfully");
    } else {
      if (selectedTable === "user_tbl") {
        // --- Admin-create user account workflow ---
        const randomPassword = generatePassword(12);
        let email = formData.user_email;
        const createUserResponse = await fetch(
          "https://sagradago.onrender.com/api/createUser",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, randomPassword }),
          }
        );
        const result = await createUserResponse.json();
        if (result.status !== "success" || !result.user?.id) {
          throw new Error(result.message || "Failed to create user via invite");
        }
        const userId = result.user.id;
        const userProfile = {
          id: userId,
          user_firstname: formData.user_firstname,
          user_middle: formData.user_middle || null,
          user_lastname: formData.user_lastname,
          user_gender: formData.user_gender,
          user_status: formData.user_status,
          user_mobile: formData.user_mobile,
          user_bday: formData.user_bday,
          user_email: formData.user_email,
        };
        const { error: profileError } = await supabase
          .from("user_tbl")
          .insert([userProfile]);
        if (profileError) {
          try {
            await supabase.auth.admin.deleteUser(userId);
          } catch {}
          throw profileError;
        }
        await supabase.from("transaction_logs").insert({
          table_name: selectedTable,
          action: "CREATE",
          record_id: userId,
          old_data: null,
          new_data: userProfile,
          performed_by: adminData
            ? `${adminData.firstName} ${adminData.lastName}`
            : "Unknown",
          performed_by_email: adminData?.email || "Unknown",
        });
        setSuccess(
          "User created successfully. An invite link has been sent to their email."
        );
      } else {
        if ("user_firstname" in updateData && selectedTable !== "user_tbl") {
          delete updateData.user_firstname;
        }
        if ("user_lastname" in updateData && selectedTable !== "user_tbl") {
          delete updateData.user_lastname;
        }
        if ("groom_fullname" in updateData) {
          delete updateData.groom_fullname;
        }
        if ("bride_fullname" in updateData) {
          delete updateData.bride_fullname;
        }
        if ("groom_1x1" in updateData) {
          delete updateData.groom_1x1;
        }
        if ("bride_1x1" in updateData) {
          delete updateData.bride_1x1;
        }
        const { data: insertedRecord, error: insertError } = await supabase
          .from(selectedTable)
          .insert([updateData]);

        if (insertError) throw insertError;

        await supabase.from("transaction_logs").insert({
          table_name: selectedTable,
          action: "CREATE",
          record_id: insertedRecord?.[0]?.id,
          old_data: null,
          new_data: updateData,
          performed_by: adminData
            ? `${adminData.firstName} ${adminData.lastName}`
            : "Unknown",
          performed_by_email: adminData?.email || "Unknown",
        });

        setSuccess("Record added successfully");
      }
    }

    setOpenDialog(false);
    handleTableSelect(selectedTable);
    fetchStats && fetchStats();
  } catch (error) {
    setError("Error saving record: " + (error.message || error));
  }
};

// ========== SACRAMENT SAVE (Corrected Version) ==========
const handleSacramentSave = async ({
  BOOKING_TABLE_STRUCTURES, // Fixed parameter name
  ALL_BOOKINGS_STRUCTURE,
  selectedSacrament,
  formData,
  editingRecord,
  sacramentTableData,
  adminData,
  setError,
  setSuccess,
  setOpenDialog, // Updated parameter name
  handleSacramentTableSelect,
  fetchStats,
}) => {
  try {
    console.log("handleSacramentSave called with:", {
      selectedSacrament,
      formData,
      editingRecord: editingRecord?.id || editingRecord,
      booking_status: formData.booking_status,
    });

    const structure =
      selectedSacrament === "all"
        ? ALL_BOOKINGS_STRUCTURE
        : BOOKING_TABLE_STRUCTURES[selectedSacrament];

    const requiredFields =
      structure?.requiredFields || [
        "user_id",
        "booking_date",
        "booking_time",
        "booking_status",
      ];
    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    // === Conflict check only if status is approved ===
    if (formData.booking_status === "approved") {
      const bookingDate = formData.booking_date;
      const bookingTime = formData.booking_time;
      if (bookingDate && bookingTime) {
        const { data: approvedBookings, error: conflictError } =
          await supabase
            .from("booking_tbl")
            .select("*")
            .eq("booking_date", bookingDate)
            .eq("booking_status", "approved");
        if (conflictError) {
          setError("Error checking for booking conflicts.");
          return;
        }
        const [h, m] = bookingTime.split(":");
        const bookingMinutes = parseInt(h, 10) * 60 + parseInt(m, 10);
        const hasConflict = approvedBookings.some((b) => {
          if (
            editingRecord &&
            (b.id === editingRecord.id || b.id === editingRecord)
          )
            return false;
          const [bh, bm] = (b.booking_time || "").split(":");
          if (!bh || !bm) return false;
          const bMinutes = parseInt(bh, 10) * 60 + parseInt(bm, 10);
          return Math.abs(bMinutes - bookingMinutes) < 60;
        });
        if (hasConflict) {
          setError(
            "There is already an approved booking within 1 hour of the selected time. Please choose a different time."
          );
          return;
        }
      }
    }

    if (editingRecord) {
      // === Updating existing
      console.log("Updating existing record:", editingRecord);
      const updateData = {
        booking_status: formData.booking_status,
        paid: formData.paid !== undefined ? formData.paid : false,
      };
      if (formData.booking_pax !== undefined) {
        updateData.booking_pax = formData.booking_pax;
      }
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) delete updateData[key];
      });

      const oldRecord = sacramentTableData.find(
        (r) => r.id === (editingRecord.id || editingRecord)
      );
      if (!oldRecord) {
        setError("Error: Could not find the record to update");
        return;
      }

      const { error: updateError } = await supabase
        .from("booking_tbl")
        .update(updateData)
        .eq("id", editingRecord.id || editingRecord);

      if (updateError) throw updateError;

      await supabase.from("transaction_logs").insert({
        table_name: "booking_tbl",
        action: "UPDATE",
        record_id: editingRecord.id || editingRecord,
        old_data: oldRecord,
        new_data: { ...oldRecord, ...updateData },
        performed_by: adminData
          ? `${adminData.firstName} ${adminData.lastName}`
          : "Unknown",
        performed_by_email: adminData?.email || "Unknown",
      });

      setSuccess("Booking updated successfully");
    } else {
      // === Creating new ===
      console.log("Creating new record");

      const {
        data: { user },
      } = await supabase.auth.getUser();
      let { data: userInfo } = await supabase
        .from("user_tbl")
        .select("*")
        .eq("id", formData.user_id || user?.id);

      let cachedUserData = userInfo?.[0] || {
        id: null,
        user_firstname: "",
        user_middle: "",
        user_lastname: "",
        user_gender: "",
        user_status: null,
        user_mobile: "",
        user_bday: "",
        user_email: "",
        date_created: "",
        date_updated: "",
        user_image: "",
        is_deleted: false,
        status: "",
      };

      const transactionId = `TXN-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      let insertData = {
        user_id: formData.user_id,
        booking_sacrament: selectedSacrament,
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        booking_pax: formData.booking_pax || 1,
        booking_status: formData.booking_status || "pending",
        booking_transaction: transactionId,
        paid: false,
      };

      let specificDocumentTable = {};
      if (selectedSacrament === "wedding") {
        specificDocumentTable = { ...formData.weddingForm };
        const validateResult = weddingFormValidation(
          specificDocumentTable,
          setError
        );
        if (!validateResult) return;
        delete formData.weddingForm;
      } else if (selectedSacrament === "baptism") {
        specificDocumentTable = { ...formData.baptismForm };
        delete formData.baptismForm;
        const validateResult = baptismFormValidation(
          cachedUserData,
          specificDocumentTable,
          setError
        );
        if (!validateResult) return;
      } else if (selectedSacrament === "burial") {
        specificDocumentTable = { ...formData.burialForm };
        delete formData.burialForm;
        const validateResult = burialFormValidation(
          cachedUserData,
          specificDocumentTable,
          setError
        );
        if (!validateResult) return;
      }

      if (Object.keys(specificDocumentTable).length > 0) {
        let specificDocumentId = await saveSpecificSacramentDocument({
          selectedSacrament,
          specificDocumentTable,
          setErrorMessage: setError,
        });
        if (!specificDocumentId) return;
        if (selectedSacrament === "wedding")
          insertData.wedding_docu_id = specificDocumentId;
        else if (selectedSacrament === "baptism")
          insertData.baptism_docu_id = specificDocumentId;
        else if (selectedSacrament === "burial")
          insertData.burial_docu_id = specificDocumentId;
      }

      const { data: insertedRecord, error: insertError } = await supabase
        .from("booking_tbl")
        .insert([insertData])
        .select()
        .single();

      if (insertError) throw insertError;

      await supabase.from("transaction_logs").insert({
        table_name: "booking_tbl",
        action: "CREATE",
        record_id: insertedRecord.id,
        old_data: null,
        new_data: insertedRecord,
        performed_by: adminData
          ? `${adminData.firstName} ${adminData.lastName}`
          : "Unknown",
        performed_by_email: adminData?.email || "Unknown",
      });

      setSuccess("Booking created successfully");
    }

    if (setOpenDialog) setOpenDialog(false);
    if (handleSacramentTableSelect) handleSacramentTableSelect(selectedSacrament);
    if (fetchStats) fetchStats();
  } catch (error) {
    console.error("handleSacramentSave error:", error);
    setError("Error saving record: " + (error.message || error));
  }
};

export { handleSave, handleSacramentSave };