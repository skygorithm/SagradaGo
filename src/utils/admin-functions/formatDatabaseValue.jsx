import { Call, MailOutline, Person } from "@mui/icons-material";

const formatValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toLocaleDateString();

    // Value is a string that is an ISO Date, convert it into readable format
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;

    if (typeof value === 'string' && isoDateRegex.test(value)) {
      const parsedDate = new Date(value);
      if (!isNaN(parsedDate)) {
        return parsedDate.toLocaleDateString();
      }
    }


    if (typeof value === 'object') return JSON.stringify(value);
    let formattedValue = String(value).trim();
    if (formattedValue.startsWith('https://') || formattedValue.startsWith('http://')) {
      return (
        <a href={`${formattedValue}`} target="_blank" rel="noopener noreferrer" className='underline text-blue-600 hover:text-blue-800'>View Document</a>);
    } else {
      return formattedValue;
    }
};

const formatDisplayValue = (field, toDisplayValue) => {
    let background = '';
    let value = formatValue(toDisplayValue);
    if (field === 'booking_status') {
        if (value === 'pending') {
            background = 'bg-yellow-200';
        } else if (value === 'approved') {
            background = 'bg-green-200';
        } else if (value === 'rejected') {
            background = 'bg-red-200';
        } else {
            background = 'bg-gray-200';
        }
        return (
            <span className={`px-2 py-1 rounded ${background}`}>
                {value}
            </span>
        )
    } else if (field === 'gender') {
        let display = '';
        if (value === 'Male') {
            background = 'bg-blue-200 text-blue-800';
            display = 'Male';
        } else if (value === 'Female') {
            background = 'bg-pink-200 text-pink-800';
            display = 'Female';
        } else {
            background = 'bg-gray-200 text-gray-800';
            display = 'Not Specified';
        }
        return (
            <span className={`px-2 py-1 rounded ${background}`}>
                {display}
            </span>
        )
    } else if (field === 'user_gender') {
        let display = '';
        if (value === 'm') {
            background = 'bg-blue-200 text-blue-800';
            display = 'Male';
        } else if (value === 'f') {
            background = 'bg-pink-200 text-pink-800';
            display = 'Female';
        } else {
            background = 'bg-gray-200 text-gray-800';
            display = 'Not Specified';
        }
        return (
            <span className={`px-2 py-1 rounded ${background}`}>
                {display}
            </span>
        )
    } else if (field === 'priest_availability') {
        // if (value === 'Available') {
        if (value === 'Yes') {
            background = 'bg-green-200 text-green-800';
        // } else if (value === 'Not Available') {
        } else if (value === 'No') {
            background = 'bg-red-200 text-red-800';
        } else {
            background = 'bg-gray-200 text-gray-800';
        }
        return (
            <span className={`px-2 py-1 rounded ${background}`}>
                {value}
            </span>
        )
    } else if (field === 'document_id' || field ==='booking_transaction') {
        return (
            <span className='bg-gray-100 text-gray-800 p-1 text-sm rounded font-mono'>
                {value}
            </span>
        );
    } else if (field === 'admin_email' || field === 'user_email') {
        return (
            <div className="flex items-center text-gray-700">
                <MailOutline className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-mono text-sm">{value}</span>
            </div>
        );
    } else if (field === 'admin_mobile' || field === 'user_mobile' || field === 'mobile') {
        return (
            <div className="flex items-center text-gray-700">
                <Call className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm">{value}</span>
            </div>
        );
    } else if (field === 'booking_pax') {
        return (
            <div className="flex items-center text-gray-700">
                <Person className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm">{value}</span>
            </div>
        );

    } else if (field === 'donation_amount') {
        return (
            <span className='bg-green-100 px-2 py-1 rounded'>
                {value ? `₱${parseFloat(value).toFixed(2)}` : '₱0.00'}
            </span>
        );
    } else if (
        field === 'request_baptismcert' || 
        field === 'request_confirmationcert' || 
        field === 'baptismal_certificate' ||
        field === 'confirmation_certificate' ||
        field === 'wedding_certificate' ||
        field === 'paid') {
        // If the value is a URL, show the image
        if (typeof toDisplayValue === 'string' && toDisplayValue.startsWith('http')) {
            return (
                <a href={toDisplayValue} target="_blank" rel="noopener noreferrer">
                    <img
                        src={toDisplayValue}
                        alt={field.replace(/_/g, ' ')}
                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, border: '1px solid #ccc', cursor: 'zoom-in' }}
                    />
                </a>
            );
        }
        // Otherwise, fallback to Yes/No/-
        let displayValue = '';
        if (value === 'yes' || value === true || value === 'Yes') {
            background = 'bg-green-200 text-green-800';
            displayValue = 'Yes';
        } else if (value === 'no' || value === false || value === 'No') {
            background = 'bg-red-200 text-red-800';
            displayValue = 'No';
        } else {
            background = 'bg-gray-200 text-gray-800';
            displayValue = '-';
        }
        return (
            <span className={`px-2 py-1 rounded ${background}`}>
                {displayValue}
            </span>
        )
    } else if (field === 'price') {
        
        if (typeof value === 'string') {
            // convert first
            value = parseFloat(value.replace(/[^0-9.-]+/g, ''));
        } 
        return (
            <span className='bg-green-100 px-2 py-1 rounded'>
                {value ? `₱${value.toLocaleString()}` : '₱0.00'}
            </span>
        );
    } else {
        return (value);
    }
}

export { formatValue, formatDisplayValue };