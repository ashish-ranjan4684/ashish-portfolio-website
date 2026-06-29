let domains = ["Full Stack Developer.","AI Engineer."];
let about_domain = document.getElementById("about-line2");
let resume_btn = document.getElementById("resume-btn");
let hamburger = document.getElementById("hamburger");
let talkEl = document.querySelector(".talk");
let menu = document.getElementById("menu");
let carouselItems = document.querySelectorAll(".carousel-item");
let menuItems = document.querySelectorAll(".menuitem");
let sections = document.querySelectorAll(".section");
/*carouselItems.forEach((item,index)=>{
    item.document.createElement("span").classList.add("blinking-dot");
});*/

/*hamburger.addEventListener("click",()=>{
    menu.classList.toggle("active");
});*/

function playSound(audioEl) {
    audioEl.currentTime = 0;
    audioEl.play();
}

const about = document.querySelector(".about");
const progress = document.querySelector(".progress-bar");

about.addEventListener("scroll", () => {

    const scrollTop = about.scrollTop;

    const scrollableHeight =
        about.scrollHeight - about.clientHeight;

    const percent = scrollTop / scrollableHeight;

    progress.style.transform = `scaleX(${percent}`;
});

//const menuItems = document.querySelectorAll(".menuitem");

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {

            menuItems.forEach(item => item.classList.remove("menuitem-active"));

            if(entry.target.id){
                document.querySelector(`[data-section="${entry.target.id}"]`).classList.add("menuitem-active");
            }
        }
    });
}, {
    root:document.querySelector(".about"),
    threshold: 0.2
});

sections.forEach(section => observer.observe(section));

talkEl.addEventListener("click",async()=>{
    window.location.href="/talk";

});
async function typeWriter(){
    let i = 0;
    while (true) { // Loop infinitely
        let domain = domains[i];
        
        // 1. Typing Phase
        for (let j = 0; j <= domain.length; j++) {
            about_domain.innerText = domain.slice(0, j);
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 2. Pause at the end
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 3. Backspacing Phase
        for (let j = domain.length; j >= 0; j--) {
            about_domain.innerText = domain.slice(0, j);
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // 4. Move to next domain
        i = (i + 1) % domains.length;
    }
}

typeWriter();

resume_btn.addEventListener("click",async()=>{
    console.log("Resume button clicked");
    let result = await fetch("/resume",{
        method:"GET",
        headers:{
            "Content-Type":"application/pdf"
        }
    });

    if(result.status === 200){
        let blob = await result.blob();
        let url = URL.createObjectURL(blob);
        window.open(url,"_blank");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.getElementById("hamburger");
    const menu = document.getElementById("menu");

    if (hamburger && menu) {
        hamburger.addEventListener("click", () => {
            // Toggle classes to open/close menu layout
            menu.classList.toggle("active");
            hamburger.classList.toggle("active");

            // Dynamically alter character view states between hamburger and close sign
            /*if (hamburger.classList.contains("active")) {
                hamburger.innerHTML = "&#10005;"; // Unicode code for "✕" (Close cross)
            } else {
                hamburger.innerHTML = "&#9776;";  // Unicode code for "☰" (Hamburger lines)
            }*/
        });

        // Optional convenience feature: close the overlay menu layout when any link item gets tapped
        const menuItems = menu.querySelectorAll(".menuitem");
        menuItems.forEach(item => {
            item.addEventListener("click", () => {
                menu.classList.remove("active");
                hamburger.classList.remove("active");
                /*hamburger.innerHTML = "&#9776;";*/
            });
        });
    }
});
/*document.getElementById("about-btn").addEventListener("click", () => {
    document.getElementById("about-me").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});*/

document.querySelector(".down-arrow").addEventListener("click", () => {
    document.getElementById("about-me").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

document.querySelector(".cert-card").addEventListener("click",()=>{
    window.location.href="certificate-view.html";
});

menuItems.forEach((el,index)=>{
    el.addEventListener("click",(event)=>{
        let targetElId = event.target.getAttribute("data-section");
        console.log(targetElId);
        document.getElementById(targetElId).scrollIntoView({
            behavior:"smooth",
            block:"start"
        });
    });
    
});

document.querySelectorAll(".contact-options").forEach(el=>{
    el.addEventListener("click",(event)=>{
        if(el.classList.contains("facebook")){
            window.location.href="https://www.facebook.com/profile.php?id=100010094403883";
        }else if(el.classList.contains("instagram")){
            window.location.href="https://www.instagram.com/1718.ashish?utm_source=qr";
        }else if(el.classList.contains("linkedin")){
            window.location.href="https://www.linkedin.com/in/ashish-ranjan-b46294231";
        }else if(el.classList.contains("email")){
            window.location.href="mailto:ashish.ranjan4684@gmail.com";
        }else{
            console.log("ullu");
        }
    });
    
});

document.querySelector(".message-send-btn").addEventListener("click",async(event)=>{
    if("vibrate" in navigator){
        navigator.vibrate(50);
    }
    
    let emailEl = document.querySelector(`#email`);
    let nameEl = document.querySelector(`#name`);
    let orgEl = document.querySelector(`#org`);
    let messageEl = document.querySelector(`#message-input`);
    let button = document.querySelector(".message-send-btn")
    if(!nameEl.value){
        return
    }else if(!emailEl.value){
        return;
    }
    
    button.textContent="";
    button.classList.add('disabled');
    for(let i=1;i<=3;i++){
        let dotEl = document.createElement("div");
        dotEl.classList.add("dot",`dot${i}`);
        event.target.appendChild(dotEl);
    }
    let result = await fetch("/send-message",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            name: nameEl.value,
            email: emailEl.value,
            org: orgEl.value,
            message: messageEl.value
        })
    });

    nameEl.value = "";
    messageEl.value = "";
    emailEl.value = "";
    orgEl.value = "";

    for(let i=1;i<=3;i++){
        let dotEl = document.querySelector(`.dot${i}`);
        //dotEl.classList.add("dot",`dot${i}`);
       event.target.removeChild(dotEl);
    }
    if(result.status===200){
        playSound(document.getElementById("successsound"));
        console.log("message sent successfully");
        event.target.classList.add("success");
        event.target.textContent="Message sent successfully";
        setTimeout(()=>{
            button.classList.remove("success");
            button.textContent = "Send Message";
            button.classList.remove("disabled");
        },2000);
    }else{
        playSound(document.getElementById("errorsound"));
        console.log("Message could not be sent.");
        event.target.classList.add("failure");
        event.target.textContent="Message could not be sent";
        setTimeout(()=>{
            button.classList.remove("failure");
            button.textContent = "Send Message";
            button.classList.remove("disabled");
        },2000);
    }
});