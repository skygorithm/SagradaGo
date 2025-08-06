const BarChartLegend = ({data, colors}) => {
    return (
        <div className="flex flex-wrap justify-center gap-2 mt-2">
            {data.map((entry, index) => (
            <div key={entry.sacrament} className="flex items-center gap-1">
                <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-xs">{entry.sacrament}</span>
            </div>
            ))}
        </div>
    );
}

const PieChartLegend = ({data, colors}) => {
    return (
        <div className="flex flex-wrap justify-center gap-2 mt-2">
            {data.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1">
                    <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="text-xs">{entry.name}: {entry.value}</span>
                </div>
            ))}
        </div>
    );
}

export { 
    BarChartLegend,
    PieChartLegend
};