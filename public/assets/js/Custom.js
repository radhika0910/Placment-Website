new Chart(document.getElementById("bar-chart"), {
  type: "bar",
  data: {
    labels: ["2018", "2019", "2020", "2024", "2025"],
    datasets: [
      {
        label: "Highest Package (lakh)",
        backgroundColor: [
          "#3e95cd",
          "#8e5ea2",
          "#3cba9f",
          "#e8c3b9",
          "#c45850",
        ],
        data: [20, 18, 22, 17, 26],
      },
    ],
  },
  options: {
    legend: { display: false },
    title: {
      display: true,
      text: "Highest package from 2018 to 2025",
    },
  },
});

// // Email.send({
// //     Host : "smtp.elasticemail.com",
// //     SecureToken : "7720fefd-5993-400f-adaf-47ed7745aa1a",
// //     To : 'them@website.com',
// //     From : "you@isp.com",
// //     Subject : "This is the subject",
// //     Body : "And this is the body"
// // }).then(
// //   message => alert(message)
// // );

// function sendMail(params){
//     var tempParams ={
//         from_name: document.getElementById("fromName").ariaValueMax,
//         to_name: document.getElementById("toName").ariaValueMax,
//         message: document.getElementById("msg").ariaValueMax,

//     };
//     emailjs.send(service_k6z29ln, template_qdkc3ei, tempParams)
//     .then(function(res){
//         console.log("Sucess",res.status);
//     })
// }

const btn = document.getElementById("button");

document.getElementById("form").addEventListener("submit", function (event) {
  event.preventDefault();

  btn.value = "Sending...";

  const serviceID = "default_service";
  const templateID = "template_qdkc3ei";

  emailjs.sendForm(serviceID, templateID, this).then(
    () => {
      btn.value = "Send Email";
      alert("Sent!");
    },
    (err) => {
      btn.value = "Send Email";
      alert(JSON.stringify(err));
    }
  );
});

const galleryContainer = document.querySelector(".gallery-container");
const galleryControlsContainer = document.querySelector(".gallery-controls");
const galleryControls = ["previous", "next"];
const galleryItems = document.querySelectorAll(".gallery-item");

class Carousel {
  constructor(container, items, controls) {
    this.carouselContainer = container;
    this.carouselControls = controls;
    this.carouselArray = [...items];
  }

  // Update css classes for gallery
  updateGallery() {
    this.carouselArray.forEach((el, index) => {
      el.classList.remove(`gallery-item-${index + 1}`);
    });

    this.carouselArray.forEach((el, index) => {
      el.classList.add(`gallery-item-${index + 1}`);
    });
  }

  // Update the current order of the carouselArray and gallery
  setCurrentState(direction) {
    if (direction.className === "gallery-controls-previous") {
      this.carouselArray.unshift(this.carouselArray.pop());
    } else {
      this.carouselArray.push(this.carouselArray.shift());
    }

    this.updateGallery();
  }

  setControls() {
    this.carouselControls.forEach((control) => {
      galleryControlsContainer.appendChild(
        document.createElement("button")
      ).className = `gallery-controls-${control}`;

      document.querySelector(`.gallery-controls-${control}`).innerText =
        control;
    });
  }

  useControls() {
    const triggers = [...galleryControlsContainer.childNodes];

    triggers.forEach((control) => {
      control.addEventListener("click", (e) => {
        e.preventDefault();

        if (control.className === "gallery-controls-add") {
          const newItem = document.createElement("div");
          const latestItem = this.carouselArray.length;
          const latestIndex =
            this.carouselArray.findIndex(
              (item) =>
                item.getAttribute("data-index") == this.carouselArray.length
            ) + 1;

          this.carouselArray.splice(latestIndex, 0, newItem);
          document.querySelector(`[data-index="${latestItem}"]`).after(newItem);
          this.updateGallery();

          // Add nature-themed YouTube videos
          const videoLinks = [
            "https://www.youtube.com/watch?v=dWSctQQX-fA&t=35s&ab_channel=YCCEOFFICIAL",
            "https://www.youtube.com/watch?v=dWSctQQX-fA&t=35s&ab_channel=YCCEOFFICIAL",
            "https://www.youtube.com/watch?v=dWSctQQX-fA&t=35s&ab_channel=YCCEOFFICIAL",
          ];

          const randomVideoId =
            videoLinks[Math.floor(Math.random() * videoLinks.length)];
          const iframe = createYouTubeIframe(randomVideoId);
          newItem.appendChild(iframe);
        } else {
          this.setCurrentState(control);
        }
      });
    });
  }
}

// Create a YouTube iframe element
function createYouTubeIframe(videoId) {
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube.com/embed/${videoId}`;
  iframe.width = "100%";
  iframe.height = "100%";
  iframe.allowFullscreen = true;
  iframe.setAttribute("frameborder", "0");

  return iframe;
}

const exampleCarousel = new Carousel(
  galleryContainer,
  galleryItems,
  galleryControls
);

exampleCarousel.setControls();
exampleCarousel.useControls();
