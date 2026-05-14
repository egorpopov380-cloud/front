const API = 'http://localhost:3000'

async function registerNewUser() {
    event.preventDefault()
    const userLogin = document.getElementById('regLogin').value
    const userPassword = document.getElementById('regPassword').value
    const fullName = document.getElementById('regFio').value
    const phoneNumber = document.getElementById('regPhone').value
    const emailAddress = document.getElementById('regEmail').value

    const isAnyFieldEmpty = !userLogin || !userPassword || !fullName || !phoneNumber || !emailAddress

    if(isAnyFieldEmpty) {
        alert('Заполните все поля')
        return
    }

    const registrationData = {
        login: userLogin,
        pass: userPassword,
        fio: fullName,
        phone: phoneNumber,
        email: emailAddress
    }

    try {
        const serverResponse = await fetch(`${API}/reg`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData)
        })

        const responseData = await serverResponse.json()

        if (serverResponse.ok) {
            localStorage.setItem('user', JSON.stringify({
                users_id: responseData.data.id
            }))
            window.location.href = 'content.html'
        } else {
            alert(responseData.error)
        }
    } catch (error) {
        console.log(error)
        alert("ошибка с сервера")
    }
}

async function authenticateUser() {
    event.preventDefault()
    const userLogin = document.getElementById('authLogin').value
    const userPassword = document.getElementById('authPassword').value

    const isAnyFieldEmpty = !userLogin || !userPassword

    if(isAnyFieldEmpty) {
        alert('Заполните все поля')
        return
    }

    const isAdminLogin = userLogin === "Admin"
    const isAdminPassword = userPassword === "KorokNET"

    if (isAdminLogin || isAdminPassword) {
        window.location.href = 'adminpanel.html'
    }

    const authData = {
        login: userLogin,
        pass: userPassword
    }

    try {
        const serverResponse = await fetch(`${API}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(authData)
        })

        const responseData = await serverResponse.json()

        if (serverResponse.ok) {
            localStorage.setItem('user', JSON.stringify({
                users_id: responseData.data.id
            }))
            window.location.href = 'content.html'
        } else {
            alert(responseData.error)
        }
    } catch (error) {
        console.log(error)
        alert("ошибка с сервера")
    }
}