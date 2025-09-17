export function DistrictTotals({ sortedDistricts }) {
    return (
        <div>
            <h2>District Totals</h2>
            {sortedDistricts.map((dist, idx) => (
                <div key={idx}>
                    <h3>{dist.district}</h3>
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Party</th>
                                <th>Votes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dist.parties.map((p, i) => (
                                <tr key={i}>
                                    <td>{p.party}</td>
                                    <td>{p.votes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}