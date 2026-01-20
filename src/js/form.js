document.getElementById("parentForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = e.target;
  const name = form.name.value || "";
  const email = form.email.value || "";
  const message = form.message.value || "";

  /* =============================
        EASTER EGG CHECK
  ============================= */
  const easterName = name.trim().toLowerCase();
  const easterEmail = email.trim().toLowerCase();
  const easterMsg = message.trim().toLowerCase();

  const msgTriggers = ["<3", "mặt trời mọc"];

  if (
    easterName === "minh huy" &&
    easterEmail === "a@gmail.com" &&
    msgTriggers.includes(easterMsg)
  ) {
    window.open("https://ditmeongtroi.x10.mx/", "_blank");
    return; // không gửi form nữa
  }

  /* =============================
        NORMAL SUBMISSION LOGIC
  ============================= */

  // Trigger flying letter animation
  const letter = document.getElementById("flyingLetter");
  letter.style.opacity = "1";
  letter.style.transition = "transform 1.4s ease-out, opacity 1.4s";
  letter.style.transform = "translateX(-50%) translateY(-260px)";
  letter.style.opacity = "0";

  setTimeout(() => {
    const popup = document.getElementById("successPopup");
    popup.style.opacity = "1";

    setTimeout(() => { popup.style.opacity = "0"; }, 1800);
  }, 400);

  // Reset form
  form.reset();
  document.getElementById("handPreview").textContent = "(Nội dung thư sẽ hiển thị tại đây…)";
  document.getElementById("charcount").textContent = "0";
});
