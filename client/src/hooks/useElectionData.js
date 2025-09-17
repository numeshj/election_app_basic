import { useMemo } from "react";

export function useElectionData(results) {
  return useMemo(() => {
    const islandTotal = {};
    const districtTotals = {};

    results.forEach((file) => {
      const key = file.ed_code + "-" + file.ed_name;

      if (!districtTotals[key]) {
        districtTotals[key] = { hasDistrictTotal: false, votes: {} };
      }

      if (file.level === "ELECTORAL-DISTRICT") {
        districtTotals[key].hasDistrictTotal = true;
        districtTotals[key].votes = {};
        file.by_party.forEach((party) => {
          districtTotals[key].votes[party.party_code] = party.votes;
        });
      } else if (!districtTotals[key].hasDistrictTotal) {
        file.by_party.forEach((party) => {
          if (!districtTotals[key].votes[party.party_code]) {
            districtTotals[key].votes[party.party_code] = 0;
          }
          districtTotals[key].votes[party.party_code] += party.votes;
        });
      }
    });

    Object.values(districtTotals).forEach((district) => {
      Object.entries(district.votes).forEach(([party, votes]) => {
        if (!islandTotal[party]) islandTotal[party] = 0;
        islandTotal[party] += votes;
      });
    });

    const sortedIsland = Object.entries(islandTotal)
      .map(([party, votes]) => ({ party, votes }))
      .sort((a, b) => b.votes - a.votes);

    const sortedDistricts = Object.entries(districtTotals).map(
      ([key, data]) => ({
        district: key,
        parties: Object.entries(data.votes)
          .map(([party, votes]) => ({ party, votes }))
          .sort((a, b) => b.votes - a.votes),
      })
    );

    return { sortedIsland, sortedDistricts };
  }, [results]);
}
