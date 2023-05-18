$(function () {
  let clipboard = new ClipboardJS(".copy", {
    text: function(trigger) {
      return $(trigger).parent("li").find("input").val();
    }
  });

  clipboard.on("success", (e) => {
    $(e.trigger).text("Copied!");
    setTimeout(() => {
      $(e.trigger).text("Copy");
    }, 1000)
  });

  clipboard.on("error", (e) => {
    alert("出大问题, 复制失败了");
  });

  chrome.storage.sync.get({token: "", domain: "", account: "", password: ""}, (storage) => {
    const $initialize = () => {
      $.ajax({
        url: storage.domain + "/api/v1/tokens",
        dataType: "JSON",
        type: "POST",
        async: true,
        data: {
          email: storage.account,
          password: storage.password
        },
        success: (response) => {
          if (response.status) {
            chrome.storage.sync.set({token: response.data.token});
          } else {
            alert(response.msg);
          }
        },
        error: (error) => {
           alert("出大问题, Token获取失败了, 请检查你的配置.")
        }
      });

      $setHistory();
    };

    const $setHistory = () => {
      // 历史记录
      chrome.storage.local.get(["history"], (result) => {
        if (result.history) {
          for (let i = 0; i < result.history.length; i++) {
            $(".history-container ul.link-items").prepend('<li><input type="text" value="' + result.history[i].url + '"><span class="copy">Copy</span></li>');
          }
        }
      })
    };

    let formData = new FormData(), num = 0;
    $("#image-input").on("change", function () {
      let obj = $(this).get(0);
      let length = obj.files.length;
      for (let i = 0; i < length; i++) {
        formData.append('file',obj.files[i]);
        $.ajax({
          url: storage.domain + "/api/v1/upload",
          dataType: "JSON",
          type: "POST",
          async: true,
          data: formData,
          headers: {Authorization: "Bearer " + storage.token},
          processData: false,
          contentType: false,
          beforeSend: () => {
            num++;
            $('.select-files').attr('disabled', true).text("上传中(" + num + ")...");
          },
          success: (response) => {
            
            if (response.status) {
              console.log(response);
              $(".container > ul.link-items").prepend('<li><input type="text" value="' + response.data.links.url + '"><span class="copy">Copy</span></li>');
              chrome.storage.sync.get(["history"], (result) => {
                let history = result.history || [];
                history.push({url: response.data.links.url});
                chrome.storage.sync.set({history: history});
              });
              num--;
              if (num === 0) {
                $('.select-files').attr('disabled', false).text("选择图片");
              } else {
                $('.select-files').attr('disabled', true).text("上传中(" + num + ")...");
              }
            }
          },
          error: function (error) {
            alert("出大问题, 文件上传失败了, 请检查你的配置.")
          },
          complete: function () {
            $("#image-input").val("");
          }
        });
      }
    });

    $(".select-files").click(function () {
      $("#image-input").click();
    });

    $(".history").click(function () {
      $(".history-mask").fadeIn();
      $(".container").css("min-height", "500px");
      $(".history-container").css("bottom", "0");
    });

    $(".history-mask").click(function () {
      $(this).fadeOut();
      $(".history-container").css("bottom", "-400px");
      setTimeout(() => {
        $(".container").css("min-height", "inherit");
      }, 300)
    });

    $(".clear-history").click(function () {
      chrome.storage.local.clear();
      $(".history-container ul.link-items").html("");
    });

    $initialize();
  });
});
