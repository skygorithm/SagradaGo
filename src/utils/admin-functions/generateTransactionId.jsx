  const generateTransactionId = () => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `TRX-${timestamp}-${random}`;
  };

  export default generateTransactionId;