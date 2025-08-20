import { supabase } from "../../config/supabase";
import saveSpecificSacramentDocument from "../form-functions/saveSpecificSacramentDocument";
import saveWeddingDocument from "../form-functions/saveWeddingDocument";
import baptismFormValidation from "../form-validations/baptismFormValidation";
import burialFormValidation from "../form-validations/burialFormValidation";
import weddingFormValidation from "../form-validations/weddingFormValidation";
import generatePassword from "./generatePassword";

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
      
      if (selectedTable === 'user_tbl') {
        if (formData.user_email) {
          // if email is not valid
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) {
            setError('Please enter a valid email address.');
            return false;
          }
        }
        
        if (formData.user_mobile) {
          if (!/^\d+$/.test(formData.user_mobile)) {
            setError('Mobile number must contain only numbers.');
            return false;
          }
          if (!formData.user_mobile.startsWith('09') || formData.user_mobile.length !== 11) {
            setError('Mobile number must be 11 digits long and start with 09.');
            return false;
          }
        }
        
        if (formData.user_bday) {
          // Age validation
          const today = new Date();
          const birthDate = new Date(formData.user_bday);
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          const dayDiff = today.getDate() - birthDate.getDate();

          if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && dayDiff < 0)) {
            setError('The user must be at least 18 years old to join SagradaGo.');
            return false;
          }
        } else {
          setError('Please enter a valid birth date.');
          return false;
        }

        if (formData.user_gender) {
          if (formData.user_gender === '') {
            setError('Please select a gender');
            return false;
          }
        } else {
          setError('Please select a gender');
          return false;
        }
      }

      const requiredFields = TABLE_STRUCTURES[selectedTable].requiredFields;
      const missingFields = requiredFields.filter(field => !formData[field]);
      console.log("requiredFields:", requiredFields);
      console.log("missingFields:", missingFields);
      
      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Booking conflict logic
      if (selectedTable === 'booking_tbl') {
        // Only check for conflicts on create or if date/time changed on edit
        const bookingDate = formData.booking_date;
        const bookingTime = formData.booking_time;
        if (bookingDate && bookingTime) {
          // Fetch approved bookings for the same date
          const { data: approvedBookings, error: conflictError } = await supabase
            .from('booking_tbl')
            .select('*')
            .eq('booking_date', bookingDate)
            .eq('booking_status', 'approved');
          if (conflictError) {
            setError('Error checking for booking conflicts.');
            return;
          }
          // Convert booking time to minutes
          const [h, m] = bookingTime.split(':');
          const bookingMinutes = parseInt(h, 10) * 60 + parseInt(m, 10);
          // Check for conflicts within 1 hour (60 minutes)
          const hasConflict = approvedBookings.some(b => {
            if (editingRecord && b.id === editingRecord) return false; // skip self when editing
            const [bh, bm] = (b.booking_time || '').split(':');
            if (!bh || !bm) return false;
            const bMinutes = parseInt(bh, 10) * 60 + parseInt(bm, 10);
            return Math.abs(bMinutes - bookingMinutes) < 60;
          });
          if (hasConflict) {
            setError('There is already an approved booking within 1 hour of the selected time. Please choose a different time.');
            return;
          }
        }
      }

      if (editingRecord) {
        // Handle updates
        console.log('Editing record:', editingRecord);
        console.log('Current form data:', formData);
        if ('user_firstname' in formData && selectedTable !== 'user_tbl') {
          delete formData.user_firstname;
        }
        if ('user_lastname' in formData && selectedTable !== 'user_tbl') {
          delete formData.user_lastname;
        }
        
        // Log the update
        const oldRecord = tableData.find(r => r.id === editingRecord);
        console.log('Found old record:', oldRecord);
        
        if (!oldRecord) {
          console.error('Could not find old record for ID:', editingRecord);
          setError('Error: Could not find the record to update');
          return;
        }

        // Update the record first
        const { error: updateError } = await supabase
          .from(selectedTable)
          .update(formData)
          .eq('id', editingRecord);

        if (updateError) {
          console.error('Error updating record:', updateError);
          throw updateError;
        }

        // Then log the transaction with admin info
        try {
          const { error: logError } = await supabase
            .from('transaction_logs')
            .insert({
              table_name: selectedTable,
              action: 'UPDATE',
              record_id: editingRecord,
              old_data: oldRecord,
              new_data: formData,
              performed_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : 'Unknown',
              performed_by_email: adminData?.email || 'Unknown'
            });
            
          if (logError) {
            console.error('Error logging transaction:', logError);
            throw logError;
          }
          console.log('Successfully logged transaction');
        } catch (logError) {
          console.error('Failed to log transaction:', logError);
          throw logError;
        }

        setSuccess('Record updated successfully');
      } else {
        // Handle new record creation
        if (selectedTable === 'user_tbl') {
          // Create new user

          // Generate a random password
          const randomPassword = generatePassword(12);
          let email =  formData.user_email;
          // call the api createUser endpoint to create the user, and send an invite link for them to set the password
          // Note: the localhost:5001 link should be changed when pushing into production depending on where will you host the server
          const createUserResponse = await fetch('http://localhost:5001/admin/createUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, randomPassword }),
          });
          // createUserResponse will contain:
          // {
          //   status: 'success' or 'error',
          //   message: 
          //   details:
          //   user:
          // }

          // NOTE: Old Copy, signing up the new user is not recommended if you are using an Admin Account
          // const { data: authData, error: authError } = await supabase.auth.signUp({
          //   email: formData.user_email,
          //   password: randomPassword,
          //   options: {
          //     emailRedirectTo: `${window.location.origin}/auth/callback`
          //   }
          // });

          const result = await createUserResponse.json();

          if (result.status !== 'success' || !result.user?.id) {
            console.error('Error from createUser endpoint:', result.message || 'Unknown error');
            throw new Error(result.message || 'Failed to create user via invite');
          }

          const userId = result.user.id;

          // Create user profile in user_tbl
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

          console.log('Creating user profile:', userProfile);

          // Insert into user_tbl
          const { error: profileError } = await supabase
            .from('user_tbl')
            .insert([userProfile]);

          if (profileError) {
            console.error('Profile error:', profileError);
            // If profile creation fails, try to clean up the auth user
            try {
              await supabase.auth.admin.deleteUser(userId);
            } catch (deleteError) {
              console.error('Failed to clean up auth user:', deleteError);
            }
            throw profileError;
          }

          // Log the creation with admin info
          await supabase
            .from('transaction_logs')
            .insert({
              table_name: selectedTable,
              action: 'CREATE',
              record_id: userId,
              old_data: null,
              new_data: userProfile,
              performed_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : 'Unknown',
              performed_by_email: adminData?.email || 'Unknown'
            });

          setSuccess('User created successfully. An invite link has been sent to their email.');
        } else {
          // Handle other tables
          const { error: insertError } = await supabase
            .from(selectedTable)
            .insert([formData]);

          if (insertError) throw insertError;

          // Log the creation with admin info
          await supabase
            .from('transaction_logs')
            .insert({
              table_name: selectedTable,
              action: 'CREATE',
              record_id: formData.id,
              old_data: null,
              new_data: formData,
              performed_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : 'Unknown',
              performed_by_email: adminData?.email || 'Unknown'
            });

          setSuccess('Record added successfully');
        }
      }

      setOpenDialog(false);
      handleTableSelect(selectedTable);
      fetchStats();
    } catch (error) {
      console.error('Error in handleSave:', error);
      setError('Error saving record: ' + error.message);
    }
};

const handleSacramentSave = async ({
    BOOKING_TABLE_STRUCTURES,
    selectedSacrament,
    formData,
    editingRecord,
    sacramentTableData,
    adminData,
    setError,
    setSuccess,
    setOpenSacramentDialog,
    handleSacramentTableSelect,
    fetchStats
}) => {
    try {
      const requiredFields = BOOKING_TABLE_STRUCTURES[selectedSacrament].requiredFields;
      const missingFields = requiredFields.filter(field => !formData[field]);
      console.log("requiredFields:", requiredFields);
      console.log("missingFields:", missingFields);
      
      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Booking conflict logic
    // Only check for conflicts on create or if date/time changed on edit
    const bookingDate = formData.booking_date;
    const bookingTime = formData.booking_time;
    if (bookingDate && bookingTime) {
        // Fetch approved bookings for the same date
        const { data: approvedBookings, error: conflictError } = await supabase
        .from('booking_tbl')
        .select('*')
        .eq('booking_date', bookingDate)
        .eq('booking_status', 'approved');
        if (conflictError) {
            setError('Error checking for booking conflicts.');
            return;
        }
        // Convert booking time to minutes
        const [h, m] = bookingTime.split(':');
        const bookingMinutes = parseInt(h, 10) * 60 + parseInt(m, 10);
        // Check for conflicts within 1 hour (60 minutes)
        const hasConflict = approvedBookings.some(b => {
        if (editingRecord && b.id === editingRecord) return false; // skip self when editing
        const [bh, bm] = (b.booking_time || '').split(':');
        if (!bh || !bm) return false;
        const bMinutes = parseInt(bh, 10) * 60 + parseInt(bm, 10);
        return Math.abs(bMinutes - bookingMinutes) < 60;
        });
        if (hasConflict) {
            setError('There is already an approved booking within 1 hour of the selected time. Please choose a different time.');
            return;
        }
    }

      if (editingRecord) {
        // Handle updates
        console.log('Editing record:', editingRecord);
        console.log('Current form data:', formData);
        if ('user_firstname' in formData) {
          delete formData.user_firstname;
        }
        if ('user_lastname' in formData) {
          delete formData.user_lastname;
        }
        // keep just in case
        if ('groom_fullname' in formData) {
          delete formData.groom_fullname;
        }
        if ('bride_fullname' in formData) {
          delete formData.bride_fullname;
        }
        if ('groom_1x1' in formData) {
          delete formData.groom_1x1;
        }
        if ('bride_1x1' in formData) {
          delete formData.bride_1x1;
        }

        
        // Log the update
        const oldRecord = sacramentTableData.find(r => r.id === editingRecord);
        console.log('Found old record:', oldRecord);
        
        if (!oldRecord) {
          console.error('Could not find old record for ID:', editingRecord);
          setError('Error: Could not find the record to update');
          return;
        }

        // Update the record first
        const { error: updateError } = await supabase
          .from('booking_tbl')
          .update(formData)
          .eq('id', editingRecord);

        if (updateError) {
          console.error('Error updating record:', updateError);
          throw updateError;
        }

        // Then log the transaction with admin info
        try {
          const { error: logError } = await supabase
            .from('transaction_logs')
            .insert({
              table_name: 'booking_tbl',
              action: 'UPDATE',
              record_id: editingRecord,
              old_data: oldRecord,
              new_data: formData,
              performed_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : 'Unknown',
              performed_by_email: adminData?.email || 'Unknown'
            });
            
          if (logError) {
            console.error('Error logging transaction:', logError);
            throw logError;
          }
          console.log('Successfully logged transaction');
        } catch (logError) {
          console.error('Failed to log transaction:', logError);
          throw logError;
        }

        setSuccess('Record updated successfully');
      } else {
        // Handle new record creation
        // add it on specific table as well
        const { data: { user } } = await supabase.auth.getUser();
        // if (!user) {
        //   setError('You must be logged in to make a booking.');
        //   return;
        // }
        let { data: userInfo, error: userError } = await supabase
          .from('user_tbl')
          .select('*')
          .eq('id', formData.user_id || user.id);
        if (userError) {
          console.error('Error fetching user data:', userError);
          setError('Failed to fetch user data. Please try again.');
          return;
        }
        let cachedUserData = userInfo[0];
        if (!cachedUserData) {
          cachedUserData = {
            id: null,
            user_firstname: '',
            user_middle: '',
            user_lastname: '',
            user_gender: '',
            user_status: null,
            user_mobile: '',
            user_bday: '',
            user_email: '',
            date_created: '',
            date_updated: '',
            user_image: '',
            is_deleted: false,
            status: '',
          };
        }
        console.log("FormData user id and user data, ", {
          userId: formData.user_id || user.id,
          cachedUserData,
        })

        const username = `${cachedUserData.user_lastname}, ${cachedUserData.user_firstname}${cachedUserData.user_middle ? " " + cachedUserData.user_middle : ''}`;
        let datenow = new Date();
        // Format date as YYYY-MM-DD
        const datePart = datenow.toLocaleDateString().replace(/\//g, '-');
        // Format time as HH-MM-SS
        const timePart = datenow
        .toLocaleTimeString('en-US', { hour12: false });
        datenow = `${datePart}_${timePart}`; // Combine date and time for file path compatibility
        
        // const file = await blobUrlToFile(formData.document, `${username}.png`);
        // const filePath = `private/${getDisplaySacrament(selectedSacrament)}/${datenow}_${file.name}`;

        let specificDocumentTable = {}
        if (selectedSacrament === 'wedding') {
          // Create new wedding booking
          specificDocumentTable = {
            ...specificDocumentTable,
            ...formData.weddingForm,
          }

          const validateResult = weddingFormValidation(specificDocumentTable, setError);
          if (!validateResult) {
            return; // If validation fails, exit early
          }

          const weddingGroomFullname = specificDocumentTable.groom_fullname;
          const weddingBrideFullname = specificDocumentTable.bride_fullname;
          
          // Upload IDs
          const groom1x1Url = await saveWeddingDocument(datenow, "Groom 1x1", specificDocumentTable.groom_1x1, `${username}_groom_pic_${weddingGroomFullname}.png`, setError);
          if (!groom1x1Url) {
            return;
          }
          specificDocumentTable.groom_1x1 = groom1x1Url;

          const bride1x1Url = await saveWeddingDocument(datenow, "Bride 1x1", specificDocumentTable.bride_1x1, `${username}_bride_pic_${weddingBrideFullname}.png`, setError);
          if (!bride1x1Url) {
            return;
          }
          specificDocumentTable.bride_1x1 = bride1x1Url;
          
          const groomBaptismalUrl = await saveWeddingDocument(datenow, "Groom Baptismal", specificDocumentTable.groom_baptismal_cert, `${username}_groom_baptismal_${weddingGroomFullname}.png`, setError);
          if (!groomBaptismalUrl) {
            return;
          }
          specificDocumentTable.groom_baptismal_cert = groomBaptismalUrl;

          const brideBaptismalUrl = await saveWeddingDocument(datenow, "Bride Baptismal", specificDocumentTable.bride_baptismal_cert, `${username}_bride_baptismal_${weddingBrideFullname}.png`, setError);
          if (!brideBaptismalUrl) {
            return;
          }
          specificDocumentTable.bride_baptismal_cert = brideBaptismalUrl;

          const groomConfirmationUrl = await saveWeddingDocument(datenow, "Groom Confirmation", specificDocumentTable.groom_confirmation_cert, `${username}_groom_confirmation_${weddingGroomFullname}.png`, setError);
          if (!groomConfirmationUrl) {
            return;
          }
          specificDocumentTable.groom_confirmation_cert = groomConfirmationUrl;

          const brideConfirmationUrl = await saveWeddingDocument(datenow, "Bride Confirmation", specificDocumentTable.bride_confirmation_cert, `${username}_bride_confirmation_${weddingBrideFullname}.png`, setError);
          if (!brideConfirmationUrl) {
            return;
          }
          specificDocumentTable.bride_confirmation_cert = brideConfirmationUrl;

          if (specificDocumentTable.groom_cenomar) {
            const groomCENOMARUrl = await saveWeddingDocument(datenow, "Groom CENOMAR", specificDocumentTable.groom_cenomar, `${username}_groom_cenomar_${weddingGroomFullname}.png`, setError);
            if (!groomCENOMARUrl) {
              return;
            }
            specificDocumentTable.groom_cenomar = groomCENOMARUrl;
          }
          if (specificDocumentTable.bride_cenomar) {
            const brideCENOMARUrl = await saveWeddingDocument(datenow, "Bride CENOMAR", specificDocumentTable.bride_cenomar, `${username}_bride_cenomar_${weddingBrideFullname}.png`, setError);
            if (!brideCENOMARUrl) {
              return;
            }
            specificDocumentTable.bride_cenomar = brideCENOMARUrl;
          }
          if (specificDocumentTable.marriage_license) {
            const marriageLicenseUrl = await saveWeddingDocument(datenow, "Marriage License", specificDocumentTable.marriage_license, `${username}_marriage_license_${weddingGroomFullname}_${weddingBrideFullname}.png`, setError);
            if (!marriageLicenseUrl) {
              return;
            }
            specificDocumentTable.marriage_license = marriageLicenseUrl;
          }
          if (specificDocumentTable.marriage_contract) {
            const marriageContractUrl = await saveWeddingDocument(datenow, "Marriage Contract", specificDocumentTable.marriage_contract, `${username}_marriage_contract_${weddingGroomFullname}_${weddingBrideFullname}.png`, setError);
            if (!marriageContractUrl) {
              return;
            }
            specificDocumentTable.marriage_contract = marriageContractUrl;
          }
          const groomBannsUrl = await saveWeddingDocument(datenow, "Groom Banns", specificDocumentTable.groom_banns, `${username}_groom_banns_${weddingGroomFullname}.png`, setError);
          if (!groomBannsUrl) {
            return;
          }
          specificDocumentTable.groom_banns = groomBannsUrl;

          const brideBannsUrl = await saveWeddingDocument(datenow, "Bride Banns", specificDocumentTable.bride_banns, `${username}_bride_banns_${weddingBrideFullname}.png`, setError);
          if (!brideBannsUrl) {
            return;
          }
          specificDocumentTable.bride_banns = brideBannsUrl;

          const groomPermissionUrl = await saveWeddingDocument(datenow, "Groom Permission", specificDocumentTable.groom_permission, `${username}_groom_permission_${weddingGroomFullname}.png`, setError);
          if (!groomPermissionUrl) {
            return;
          }
          specificDocumentTable.groom_permission = groomPermissionUrl;

          const bridePermissionUrl = await saveWeddingDocument(datenow, "Bride Permission", specificDocumentTable.bride_permission, `${username}_bride_permission_${weddingBrideFullname}.png`, setError);
          if (!bridePermissionUrl) {
            return;
          }
          specificDocumentTable.bride_permission = bridePermissionUrl;

          // Prepare the wedding booking data
          setSuccess('Wedding booking added successfully');

          // remove other formData information
          const columns = ['groom_fullname', 'bride_fullname', 'groom_1x1', 'bride_1x1'];
          columns.forEach(column => {
            delete formData[column];
          });

          delete formData.weddingForm;
        } else if (selectedSacrament === 'baptism') {
          // Create new baptism booking
          specificDocumentTable = {
            ...specificDocumentTable,
            ...formData.baptismForm,
          }

          delete formData.baptismForm;
          const validateResult = baptismFormValidation(cachedUserData, specificDocumentTable, setError);
          if (!validateResult) {
            return; // If validation fails, exit early
          }
        } else if (selectedSacrament === 'burial') {
          // Create new burial booking
          specificDocumentTable = {
            ...specificDocumentTable,
            ...formData.burialForm,
          };
          delete formData.burialForm;
          const validateResult = burialFormValidation(cachedUserData, specificDocumentTable, setError);
          if (!validateResult) {
            return;
          }
        }

        // // Upload the file first on the Supabase storage
        // const { data: storageData, error: storageError } = await supabase.storage
        //   .from('booking-documents')
        //   .upload(filePath, file);
  
        // if (storageError) {
        //   console.error('Upload error:', storageError.message);
        //   setError('Server Failed to upload the document. Please try again.');
        //   return;
        // } else {
        //   console.log('Upload successful:', storageData.path);
        // }
  
        // // Get the public URL of the uploaded file to be stored in the database
        // const { data: publicUrlData } = supabase
        //   .storage
        //   .from('booking-documents')
        //   .getPublicUrl(filePath);
  
        // const fileUrl = publicUrlData?.publicUrl;

        // formData.document = fileUrl;

        let specificDocumentId = null;
        specificDocumentId = await saveSpecificSacramentDocument({
          selectedSacrament,
          specificDocumentTable,
          setErrorMessage: setError
        })
        if (!specificDocumentId) {
          return;
        } else {
          if (selectedSacrament === 'wedding') {
            formData.wedding_docu_id = specificDocumentId;
          } else if (selectedSacrament === 'baptism') {
            formData.baptism_docu_id = specificDocumentId;
          } else if (selectedSacrament === 'burial') {
            formData.burial_docu_id = specificDocumentId;
          }
        }


        
        // Handle other tables
        const { error: insertError } = await supabase
          .from('booking_tbl')
          .insert([formData]);

        if (insertError) throw insertError;

        // Log the creation with admin info
        await supabase
          .from('transaction_logs')
          .insert({
            table_name: 'booking_tbl',
            action: 'CREATE',
            record_id: formData.id,
            old_data: null,
            new_data: formData,
            performed_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : 'Unknown',
            performed_by_email: adminData?.email || 'Unknown'
          });

        setSuccess('Record added successfully');
      }

      setOpenSacramentDialog(false);
      handleSacramentTableSelect(selectedSacrament);
      fetchStats();
    } catch (error) {
      console.error('Error in handleSave:', error);
      setError('Error saving record: ' + error.message);
    }
}



  export {
    handleSave,
    handleSacramentSave
  }