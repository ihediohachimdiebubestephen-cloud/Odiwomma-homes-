
document.addEventListener("DOMContentLoaded", function(){
  const menu = document.querySelector(".menu");
  const links = document.querySelector(".nav-links");
  if(menu && links){
    menu.addEventListener("click", function(){
      links.classList.toggle("open");
      menu.setAttribute("aria-expanded", links.classList.contains("open"));
    });
    links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));
  }
});
