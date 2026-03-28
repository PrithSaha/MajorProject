(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })

  const bookingRoot = document.querySelector('[data-booking-root]') || document

  const bookNowButton = bookingRoot.querySelector(
    '#book-now-btn, #bookNowBtn, .book-now-btn, [data-book-now]'
  )
  const bookingPanel = bookingRoot.querySelector(
    '#booking-panel, #bookingPanel, .booking-panel, [data-booking-panel]'
  )
  const checkInInput = bookingRoot.querySelector(
    '#check-in, #checkIn, input[name="checkin"], input[name="check-in"], input[name="check_in"]'
  )
  const checkOutInput = bookingRoot.querySelector(
    '#check-out, #checkOut, input[name="checkout"], input[name="check-out"], input[name="check_out"]'
  )
  const totalPriceElement = bookingRoot.querySelector(
    '#total-price, #totalPrice, .total-price, [data-total-price]'
  )
  const confirmBookingButton = bookingRoot.querySelector(
    '#confirm-booking, #confirmBookingBtn, .confirm-booking-btn, [data-confirm-booking]'
  )

  const dayInMs = 1000 * 60 * 60 * 24

  const extractPrice = () => {
    const priceSource =
      bookingRoot.querySelector('[data-price]') ||
      document.querySelector('[data-price]') ||
      bookingRoot.querySelector('#listing-price, .listing-price, .price') ||
      document.querySelector('#listing-price, .listing-price, .price')

    if (!priceSource) return 0

    const rawPrice =
      priceSource.dataset?.price ||
      priceSource.getAttribute('data-price') ||
      priceSource.textContent ||
      ''

    const numericPrice = parseFloat(rawPrice.toString().replace(/[^0-9.]/g, ''))
    return Number.isFinite(numericPrice) ? numericPrice : 0
  }

  const formatMoney = value => {
    const amount = Number.isFinite(value) ? value : 0
    return `$${amount.toFixed(2)}`
  }

  const showBookingPanel = () => {
    if (!bookingPanel) return
    bookingPanel.hidden = false
    bookingPanel.classList.remove('d-none', 'hidden')
    if (bookingPanel.style.display === 'none') {
      bookingPanel.style.display = ''
    }
  }

  const updateTotal = () => {
    if (!checkInInput || !checkOutInput || !totalPriceElement) return

    const checkInDate = new Date(checkInInput.value)
    const checkOutDate = new Date(checkOutInput.value)

    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      totalPriceElement.textContent = formatMoney(0)
      return
    }

    const nights = Math.floor((checkOutDate - checkInDate) / dayInMs)
    const safeNights = nights > 0 ? nights : 0
    const total = safeNights * extractPrice()

    totalPriceElement.textContent = formatMoney(total)
  }

  if (bookNowButton && bookingPanel) {
    bookNowButton.addEventListener('click', showBookingPanel)
  }

  if (checkInInput && checkOutInput) {
    checkInInput.addEventListener('change', updateTotal)
    checkOutInput.addEventListener('change', updateTotal)
  }

  if (confirmBookingButton) {
    confirmBookingButton.addEventListener('click', event => {
      event.preventDefault()
      alert('Booking confirmed! (Demo Mode)')
    })
  }
})()
