let userRequestsData = {}
const API = 'https://kval.onrender.com'

async function fetchUserRequests() {
    try {
        const loggedUser = JSON.parse(localStorage.getItem('user'))
        const serverResponse = await fetch(`${API}/request?users_id=${loggedUser.users_id}`, {
            method: 'GET',
        });

        const responseData = await serverResponse.json()

        if (serverResponse.ok) {
            userRequestsData = responseData.data
            renderRequestsTable(userRequestsData)
        }
    } catch (error) {
        console.log(error)
        alert("ошибка с сервера")
    }
}

function renderRequestsTable(requestsList) {
    const tableBody = document.getElementById('myTicketsBody')

    if (!requestsList || requestsList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">Нет заявок</td></tr>'
        return
    }

    tableBody.innerHTML = requestsList.map(singleRequest => `
        <tr>
            <td>${escapeHtml(singleRequest.name_course)}</td>
            <td>${singleRequest.end_date.split('T')[0]}</td>
            <td>${singleRequest.type_pay || 'Не указано'}</td>
            <td>${singleRequest.status || 'Новая'}</td>
            <td>${singleRequest.start_date.split('T')[0]}</td>
            <td>${singleRequest.review}</td>
        </tr>
    `).join('')
}

function populateReviewDropdown(requestsList) {
    const dropdownSelect = document.getElementById('otzyvKursId');

    const previouslySelected = dropdownSelect.value;

    dropdownSelect.innerHTML = '<option value="">-- выберите заявку --</option>';

    const requestsWithoutReview = requestsList.filter(req => !req.review || req.review === '');

    requestsWithoutReview.forEach(requestItem => {
        const optionElement = document.createElement('option');
        optionElement.value = requestItem.id;
        optionElement.textContent = `${requestItem.name_course}`;
        dropdownSelect.appendChild(optionElement);
    });

    if (requestsWithoutReview.length === 0) {
        dropdownSelect.innerHTML = '<option value="">Нет заявок для отзыва</option>';
    }

    const isValidPreviousSelection = previouslySelected && [...dropdownSelect.options].some(opt => opt.value === previouslySelected)

    if (isValidPreviousSelection) {
        dropdownSelect.value = previouslySelected;
    }
}

document.getElementById('otzyvKursId').addEventListener('click', function() {
    populateReviewDropdown(userRequestsData)
});

function escapeHtml(unsafeText) {
    if (!unsafeText) return '';
    return unsafeText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function submitNewReview() {
    const dropdownSelect = document.getElementById('otzyvKursId');
    const selectedCourseName = dropdownSelect.options[dropdownSelect.selectedIndex]?.textContent;
    const reviewText = document.getElementById('otzyvText').value;

    const loggedUser = JSON.parse(localStorage.getItem('user'))
    const currentUserId = loggedUser.users_id;

    const reviewData = {
        users_id: currentUserId,
        name_course: selectedCourseName,
        review: reviewText,
    }

    try {
        const serverResponse = await fetch(`${API}/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reviewData)
        })

        const responseData = await serverResponse.json()

        const isError = !serverResponse.ok

        if (isError) {
            alert(responseData.error)
        }
    } catch (error) {
        console.log(error)
        alert("ошибка с сервера")
    }
}

setInterval(fetchUserRequests, 3000)
