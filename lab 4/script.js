document.addEventListener('DOMContentLoaded', function () {
    // Event listeners for the different approaches
    document.getElementById('sychronous').addEventListener('click', fetchSynchronously);
    document.getElementById('asynchronously').addEventListener('click', getAsynchronously);
    document.getElementById('fetchPromise').addEventListener('click', fetchingWPromise);
});

// XMLHttpRequest used synchronously
function fetchSynchronously() {
    // Used to store retrieved data
    const data = [];

    // Creating XMLHttpRequest object to retrieve reference.json
    const requestRef = new XMLHttpRequest();
    requestRef.open('GET', 'data/reference.json', false);
    // Sending to server
    requestRef.send();

    // Checking if request successful 
    if (requestRef.status === 200) {
        // Parsing response to get location of data1.json
        const dataRef = JSON.parse(requestRef.responseText);
        // Using the retreived path to fetch data1.json
        data.push(loadSync('data/' + dataRef.data_location));

        // Fetching data2.json and adding it to the array
        data.push(loadSync('data/data2.json'));
    }

    // Fetching data3.json and adding it to the array
    data.push(loadSync('data/data3.json'));

    // All data fetched put into the array and refresh html table
    const allData = data.flatMap(file => file.data);
    fillingTable(allData);
}

// To fetch json file synchronously
function loadSync(path) {
    const request = new XMLHttpRequest();
    request.open('GET', path, false);
    request.send();
    if (request.status === 200) {
        return JSON.parse(request.responseText);
    } else {
        console.error('Loading failed:', path);
    }
}

// XMLHttpRequest used asynchronously with callbacks
function getAsynchronously() {
    const data = [];

    // Fetching reference.json first
    const requestRef = new XMLHttpRequest();
    requestRef.open('GET', 'data/reference.json', true);

    //When request to reference.json finishes
    requestRef.onload = function () {
        if (requestRef.status === 200) {
            //  Get the location of data1.json from the response
            const dataRef = JSON.parse(requestRef.responseText);

            // Load data1.json using location in reference.json
            loadAsync('data/' + dataRef.data_location, function (data1) {
                data.push(data1);

                // Load data2.json and add  loaded data2 to array
                loadAsync('data/data2.json', function (data2) {
                    data.push(data2);

                    // Load data3.json and add loaded data3 to array
                    loadAsync('data/data3.json', function (data3) {
                        data.push(data3);

                        // Merging data fetched and refresh html with updated
                        const allData = data.flatMap(file => file.data);
                        fillingTable(allData);
                    });
                });
            });
        } else {
            console.error('Failed to load reference.json');
        }
    };
    requestRef.send();
}

// To fetch json file asynchronously
function loadAsync(path, callback) {
    const request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.onload = function () {
        if (request.status === 200) {
            const data = JSON.parse(request.responseText);
            callback(data);
        } else {
            console.error('Failed to load:', path);
        }
    };
    request.send();
}

// Using promises to fetch data
function fetchingWPromise() {
    const allData = [];

    // using Fetch API that gives a Promise to fetch reference.json
    fetch('data/reference.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Fetching reference.json failed');
            }
            // Parsing json response 
            return response.json();
        })
        .then(dataRef => {
            // Promise.all to fetch data1.json and data2.json at the same time
            return Promise.all([
                fetch('data/' + dataRef.data_location).then(res => res.json()),
                fetch('data/data2.json').then(res => res.json())
            ]);
        })
        .then(([data1, data2]) => {
            // When files are fetched, extract and append to the array (combines)
            allData.push(...data1.data, ...data2.data);

            // Fetching data3.json
            return fetch('data/data3.json').then(res => res.json());
        })
        .then(data3 => {
            // Appending to array and update the table
            allData.push(...data3.data);
            fillingTable(allData);
        })
        .catch(error => {
            console.error('Fetching data error:', error);
        });
}

// To fill the table with student information
function fillingTable(info) {
    const tableBody = document.querySelector('#studentTable tbody');
    tableBody.innerHTML = '';

    // Loop through each student
    info.forEach(student => {
        // Row created for student
        const tableRow = document.createElement('tr');
        
        const fNameCell = document.createElement('td');
        const cellID = document.createElement('td');
        const address = document.createElement('td');

        // Splitting full name into first name and last name
        const nameSplit = student.name.split(' ');
        const fName = nameSplit[0];
        const lName = nameSplit.slice(1).join(' ');

        // Populating cells with the information
        fNameCell.textContent = fName + ' ' + lName;
        cellID.textContent = student.id;
        address.textContent = student.address;

        // Adding cells to the new rows
        tableRow.appendChild(fNameCell);
        tableRow.appendChild(cellID);
        tableRow.appendChild(address);
        // Appending and updating table
        tableBody.appendChild(tableRow);
    });
}
