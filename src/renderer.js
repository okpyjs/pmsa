$(".change-path").on("click", () => FTWA.openDialog());

$(".change-backup").on("click", () => FTWA.setBackup());

$(".enable-launcher").on("click", () => FTWA.enableLauncher());

$(".toggle-sync").on("click", function () {
  FTWA.toggleSync();
  $(this).text(
    $(this).text().trim() === "Start Synchronization"
      ? "Stop Synchronization"
      : "Start Synchronization"
  );
});

$(".go-back").on("click", () => {
  $(".configure-ftp").hide(0);
  $(".action-selector").show(0);
});

$(".change-ftp").on("click", () => {
  $(".configure-ftp").show(0);
  $(".action-selector").hide(0);
});

$(".config-input").on("keyup", function () {
  FTWA.updateConfig($(this).attr("name"), $(this).val());
});

$("#ftp_secure").on("change", function () {
  FTWA.updateConfig("ftp_secure", $(this).prop("checked"));
});

const getData = async () => {
  const response = await window.FTWA.getData();
  $(".configured-path").html(response.saved_path);
  $(".configured-backup").html(response.backup);
  $("#ftp_host").val(response.ftp_host);
  $("#ftp_username").val(response.ftp_username);
  $("#ftp_password").val(response.ftp_password);
};

getData();
