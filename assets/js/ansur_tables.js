async function LoadANSUR() {
    const files = [
        { url: "./assets/ans_tables/ANSUR_2_FEMALE.csv", gender: "Female" },
        { url: "./assets/ans_tables/ANSUR_2_MALE.csv"  , gender: "Male" }
    ];

    const results = await Promise.all(files.map(file =>
        new Promise((resolve, reject) => {
            Papa.parse(file.url, {
                download: true,
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,

                complete: result => {
                    if (result.errors.length > 0) {
                        reject(new Error(
                            `CSV parsing error (${file.url}): ${result.errors[0].message}`
                        ));
                        return;
                    }

                    resolve(result.data.map(item => {
                        const normalized = {};

                        for (const [key, value] of Object.entries(item)) {
                            normalized[key.trim().toLowerCase()] = value;
                        }

                        normalized.gender = file.gender;

                        return normalized;
                    }));
                },

                error: reject
            });
        })
    ));

    return results.flat();
}

