function zoom(e){ 
    let zoomer = e.currentTarget; 
    e.offsetX ? offsetX = e.offsetX : 
    offsetx = e.touches[0].pageX 
    e.offsetY ? offsetY = e.offsetY : 
    offsetx = e.touches[0].pageX 
    x = offsetX/zoomer.offsetWidth*150 
    y = offsetY/zoomer.offsetHeight*150 
    zoomer.style.backgroundPosition = x + '% ' + y + '%'; 
     
    }
    let selectedImageIndex = 0;

    function changeMainImg(imagesrc){ 
        const mainImage = document.getElementById('mainImage'); 
        const zoomimg = document.getElementById('zoomimg'); 
        mainImage.src = '/assets/uploads/' + imagesrc; 
        zoomimg.style.backgroundImage = 'url("/assets/uploads/' + imagesrc + '")'; 
        }

   

const sizeSelect = document.getElementById('sizeSelect'); 
let stockdetails = document.getElementById('stockdetails').value; 
const parsedStockDetails = JSON.parse(stockdetails); 
for (let size in parsedStockDetails) { 
  if (parsedStockDetails.hasOwnProperty(size)) { 
    let option = document.createElement('option'); 
    option.value = size.replace('size', ''); // Extract the size value 
    option.text = option.value; 
 
    // Check if the size is in parsedStockDetails 
    if (parsedStockDetails[size] > 0) { 
      sizeSelect.appendChild(option); 
    } else { 
      option.disabled = true; // Disable the option 
      option.style.opacity = 0.5; // Set opacity for disabled option 
      option.text += ' - Out of Stock'; // Add out of stock message 
      sizeSelect.appendChild(option); 
    } 
  } 
}


