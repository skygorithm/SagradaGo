
import { FiCamera, FiUpload } from 'react-icons/fi';
import { BiSolidImageAlt } from 'react-icons/bi';

const UploadImage = ({
    title,
    hiddenInputRef1,
    handleUploadID,
    handleChangeID,
    isIDProcessing,
    residentForm,
}) => {
    return (
        <div className="upload-box">
            <input
                onChange={handleChangeID}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={hiddenInputRef1}
            />

            <div className="upload-content">
                <b>
                {title || 'Upload Required Document Image:'}
                </b>
                <div className="preview-container">
                {isIDProcessing ? (
                    <p>Processing...</p>
                ) : residentForm.id ? (
                    <div className="flex flex-col items-center my-2 p-2 bg-white rounded-lg border">
                    <img src={residentForm.id} className="upload-img" />
                    </div>
                ) : (
                    <div className="flex flex-col items-center my-2 p-2 bg-white rounded-lg border">
                    <BiSolidImageAlt className="w-6 h-6" />
                    <p>Attach Image</p>
                    </div>
                )}
                </div>

                <div 
                className="upload-picture-btn "
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    width: "100%",
                }}
                >
                {/* <button onClick={toggleCamera} className="upload-btn">
                    <FiCamera />
                </button> */}
                <button 
                    onClick={handleUploadID} 
                    className="upload-btn"
                    style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "4px 8px",
                    backgroundColor: "#E1D5B8",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                    }}
                >
                    Upload <FiUpload style={{ marginLeft: "0.5rem" }} />
                </button>
                </div>
            </div>
        </div>
    );
};

export default UploadImage;