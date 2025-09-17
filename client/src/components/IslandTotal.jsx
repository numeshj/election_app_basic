export function IslandTotal({ sortedIsland }) {
    return (
        <div>
            <h2>Island Total</h2>
            <table className="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Party</th>
                        <th>Total Votes</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedIsland.map((p, i) => (
                        <tr key={i}>
                            <td>{p.party}</td>
                            <td>{p.votes}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}