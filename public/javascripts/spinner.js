  const spinnerWrapperEl = document.querySelector('.spinner-wrapper')
      window.addEventListener('load', () => {
        setTimeout(() => {
          spinnerWrapperEl.style.display = 'none'
        }, 1000)

      })