const form = document.getElementById('registrationForm');
const successMessage = document.getElementById('successMessage');

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Limpiar errores previos
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));

    let isValid = true;

    // Validar nombre
    const fullName = document.getElementById('fullName');
    if (fullName.value.trim().length < 3) {
        fullName.classList.add('error');
        document.getElementById('fullNameError').classList.add('show');
        isValid = false;
    }

    // Validar email
    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        email.classList.add('error');
        document.getElementById('emailError').classList.add('show');
        isValid = false;
    }

    // Validar contraseña
    const password = document.getElementById('password');
    if (password.value.length < 6) {
        password.classList.add('error');
        document.getElementById('passwordError').classList.add('show');
        isValid = false;
    }

    // Validar país
    const country = document.getElementById('country');
    if (!country.value) {
        country.classList.add('error');
        document.getElementById('countryError').classList.add('show');
        isValid = false;
    }

    // Validar género
    const gender = document.querySelector('input[name="gender"]:checked');
    const genderGroup = document.querySelector('.radio-group');
    if (!gender) {
        genderGroup.classList.add('error');
        document.getElementById('genderError').classList.add('show');
        isValid = false;
    }

    // Validar términos
    const terms = document.getElementById('terms');
    if (!terms.checked) {
        terms.classList.add('error');
        document.getElementById('termsError').classList.add('show');
        isValid = false;
    }

    if (isValid) {
        // Recopilar datos del formulario
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            if (data[key]) {
                data[key] = Array.isArray(data[key]) ? [...data[key], value] : [data[key], value];
            } else {
                data[key] = value;
            }
        });
        
        // Ensure terms is a boolean
        data.terms = data.terms === 'on' || data.terms === true;

        try {
            const response = await fetch('http://localhost:3000/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Mostrar mensaje de éxito
                successMessage.classList.add('show');
                form.reset();

                // Ocultar mensaje después de 3 segundos
                setTimeout(() => {
                    successMessage.classList.remove('show');
                }, 3000);
            } else {
                console.error('Error del servidor:', await response.text());
                alert('Hubo un error al registrar el usuario.');
            }
        } catch (error) {
            console.error('Error de red:', error);
            alert('No se pudo conectar con el servidor.');
        }
    }
});

// Limpiar mensaje de éxito al resetear
form.addEventListener('reset', function () {
    successMessage.classList.remove('show');
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
});
