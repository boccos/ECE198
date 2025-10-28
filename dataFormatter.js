function process(name, time, heartRate, SPO2, sleepLogs, surveyRes) {
    console.log({
        name: name,
        heartRate: mapArrayToPoints(heartRate),
        SPO2: mapArrayToPoints(SPO2),
        sleepLogs: mapArrayToPoints(sleepLogs),
        surveyRes: surveyRes,
    });
    return {
        name: name,
        heartRate: mapArrayToPoints(heartRate),
        SPO2: mapArrayToPoints(SPO2),
        sleepLogs: mapArrayToPoints(sleepLogs),
        surveyRes: surveyRes,
    };
}

function mapArrayToPoints(yPoints, measurementTime = 0.1) {
     return yPoints.map((y, index) => ({
        x: index * measurementTime,
        y: y
    }));
}

// Example usage
process("John Doe", "", [5, 6, 7], [8, 9, 10], [11, 12, 13], "");