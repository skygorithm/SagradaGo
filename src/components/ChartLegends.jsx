const BarChartLegend = ({ data, colors }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-2">
      {data.map((entry, index) => {
        // ✅ Pick label from either `name` or `sacrament` (fall back if not present)
        const label = entry.name || entry.sacrament || '—';

        return (
          <div key={label + index} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-xs">
              {label}
              {typeof entry.value === 'number' && `: ${entry.value}`}
              {typeof entry.count === 'number' &&
                entry.value === undefined &&
                `: ${entry.count}`}
            </span>
          </div>
        );
      })}
    </div>
  );
};


export { BarChartLegend };