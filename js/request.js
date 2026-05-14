const API = 'http://localhost:3000'

async function createNewRequest() {
    const selectedCourse = document.getElementById('kursName').value;
    const selectedStartDate = document.getElementById('kursDate').value;
    const selectedPaymentType = document.getElementById('sposobOplaty').value;

    const calculatedEndDate = calculateEndDate(selectedStartDate)

    const loggedUser = JSON.parse(localStorage.getItem('user'))
    const currentUserId = loggedUser.users_id;

    const requestData = {
        users_id: currentUserId,
        name_course: selectedCourse,
        start_date: selectedStartDate,
        type_pay: selectedPaymentType,
        end_date: calculatedEndDate,
    };

    try {
        const serverResponse = await fetch(`${API}/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })

        const responseData = await serverResponse.json()

        const isRequestSuccessful = serverResponse.ok

        if (isRequestSuccessful) {
            window.location.href = 'content.html'
        } else {
            alert(responseData.error)
        }
    } catch (error) {
        console.log(error)
        alert("ошибка с сервера")
    }
}

function calculateEndDate(startingDate) {
    const dateObject = new Date(startingDate)
    dateObject.setDate(dateObject.getDate() + 30)

    const formattedEndDate = dateObject.toISOString().split('T')[0]

    return formattedEndDate
}