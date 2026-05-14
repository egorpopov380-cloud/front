// Функция создания модального окна
function constructModal() {
    const overlayContainer = document.createElement('div');
    overlayContainer.id = 'statusModal';
    overlayContainer.className = 'modal-overlay';

    const dialogWindow = document.createElement('div');
    dialogWindow.className = 'modal-window';

    const headerSection = document.createElement('div');
    headerSection.className = 'modal-header';

    const titleHeading = document.createElement('h3');
    titleHeading.textContent = 'Изменение статуса заявки';

    const closeIcon = document.createElement('span');
    closeIcon.className = 'modal-close';
    closeIcon.id = 'closeStatusModal';
    closeIcon.innerHTML = '&times;';

    headerSection.appendChild(titleHeading);
    headerSection.appendChild(closeIcon);

    const bodySection = document.createElement('div');
    bodySection.className = 'modal-body';

    const statusForm = document.createElement('form');
    statusForm.id = 'statusChangeForm';

    const hiddenField = document.createElement('input');
    hiddenField.type = 'hidden';
    hiddenField.id = 'statusZayavkaId';

    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'input-group';

    const fieldLabel = document.createElement('label');
    fieldLabel.textContent = 'Новый статус';

    const statusSelect = document.createElement('select');
    statusSelect.id = 'newStatusSelect';

    const statusOptions = [
        { value: 'new', text: 'Новая' },
        { value: 'learning', text: 'Идет обучение' },
        { value: 'finished', text: 'Обучение завершено' }
    ];

    statusOptions.forEach(optionData => {
        const optionElement = document.createElement('option');
        optionElement.value = optionData.value;
        optionElement.textContent = optionData.text;
        statusSelect.appendChild(optionElement);
    });

    fieldGroup.appendChild(fieldLabel);
    fieldGroup.appendChild(statusSelect);

    const buttonsWrapper = document.createElement('div');
    buttonsWrapper.className = 'form-buttons';

    const saveButton = document.createElement('button');
    saveButton.type = 'submit';
    saveButton.className = 'btn-primary';
    saveButton.onclick = updateStatus;
    saveButton.textContent = 'Сохранить';

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'btn-danger';
    cancelButton.id = 'cancelStatusBtn';
    cancelButton.textContent = 'Отмена';

    buttonsWrapper.appendChild(saveButton);
    buttonsWrapper.appendChild(cancelButton);

    statusForm.appendChild(hiddenField);
    statusForm.appendChild(fieldGroup);
    statusForm.appendChild(buttonsWrapper);
    bodySection.appendChild(statusForm);
    dialogWindow.appendChild(headerSection);
    dialogWindow.appendChild(bodySection);
    overlayContainer.appendChild(dialogWindow);

    document.body.appendChild(overlayContainer);
    return overlayContainer;
}

const API = 'http://localhost:3000'

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    const modalElement = constructModal();
    const closeModalBtn = document.getElementById('closeStatusModal');
    const cancelModalBtn = document.getElementById('cancelStatusBtn');
    const statusFormElement = document.getElementById('statusChangeForm');
    const hiddenIdField = document.getElementById('statusZayavkaId');

    function hideModal() {
        modalElement.style.display = 'none';
        if (statusFormElement) statusFormElement.reset();
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', hideModal);

    modalElement.addEventListener('click', function(event) {
        if (event.target === modalElement) hideModal();
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modalElement.style.display === 'flex') hideModal();
    });

    const triggerButton = document.getElementById('rt');
    if (triggerButton) {
        triggerButton.addEventListener('click', function() {
            let applicationId = this.getAttribute('data-zayavka-id');
            if (!applicationId) {
                applicationId = prompt('Введите ID заявки');
                if (!applicationId) return;
            }
            hiddenIdField.value = applicationId;
            modalElement.style.display = 'flex';
            const selectElement = document.getElementById('newStatusSelect');
            if (selectElement) selectElement.focus();
        });
    }
});

async function fetchAllRequests() {
    try {
        const serverResponse = await fetch(`${API}/request/all`, {
            method: 'GET',
        });

        const responseData = await serverResponse.json()

        if (serverResponse.ok) {
            requests = responseData.data
            renderRequestsTable(requests)
        } else {
            alert(responseData.error)
        }
    } catch (error) {
        console.log(error)
        alert("ошибка с сервера")
    }
}

document.getElementById('adminTable').addEventListener('click', function(event) {
    if (event.target && event.target.id === 'rt') {
        const applicationId = event.target.getAttribute('data-zayavka-id');
        const modalContainer = document.getElementById('statusModal');
        const hiddenIdInput = document.getElementById('statusZayavkaId');

        if (modalContainer && hiddenIdInput) {
            hiddenIdInput.value = applicationId;
            modalContainer.style.display = 'flex';
        }
    }
})

function renderRequestsTable(requestsList) {
    const tableBody = document.getElementById('adminTableBody')

    if (!requestsList || requestsList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">Нет заявок</td></tr>'
        return
    }

    tableBody.innerHTML = requestsList.map(singleRequest => `
        <tr>
            <td>${singleRequest.id}</td>
            <td>${singleRequest.users_id}</td>
            <td >${escapeHtml(singleRequest.name_course)}</td>
            <td>${singleRequest.end_date.split('T')[0]}</td>
            <td>${singleRequest.type_pay}</td>
            <td><button id="rt" class="btn-status" data-course="${escapeHtml(singleRequest.name_course)}" data-zayavka-id="${singleRequest.id}">${singleRequest.status}</button></td>
            <td>${singleRequest.start_date.split('T')[0]}</td>
        </tr>
    `).join('')

    document.querySelectorAll('.btn-status').forEach(statusButton => {
        statusButton.addEventListener('click', function() {
            const requestIdentifier = this.getAttribute('data-id');
            const currentRequestStatus = this.getAttribute('data-status');

            const modalContainer = document.getElementById('statusModal');
            const hiddenIdInput = document.getElementById('statusZayavkaId');
            const statusDropdown = document.getElementById('newStatusSelect');

            if (modalContainer && hiddenIdInput && statusDropdown) {
                hiddenIdInput.value = requestIdentifier;

                for (let idx = 0; idx < statusDropdown.options.length; idx++) {
                    if (statusDropdown.options[idx].value === currentRequestStatus) {
                        statusDropdown.selectedIndex = idx;
                        break;
                    }
                }

                modalContainer.style.display = 'flex';
            }
        });
    });
}

async function updateStatus() {
    const statusDropdown = document.getElementById('newStatusSelect');
    const selectedStatus = statusDropdown.options[statusDropdown.selectedIndex]?.textContent;
    const userData = JSON.parse(localStorage.getItem('user'))
    const userId = userData.users_id;
    const statusButton = document.getElementById('rt');
    const courseName = statusButton.getAttribute('data-course');

    const payloadData = {
        users_id: parseInt(userId),
        name_course: courseName,
        status: selectedStatus
    }

    try {
        const serverResponse = await fetch(`${API}/request/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payloadData)
        })

        const responseData = await serverResponse.json()

        if (!serverResponse.ok) {
            alert(responseData.error)
        }
    } catch (error) {
        console.log(error)
        alert("ошибка с сервера")
    }
}

function escapeHtml(unsafeText) {
    if (!unsafeText) return '';
    return unsafeText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

setInterval(fetchAllRequests, 3000)