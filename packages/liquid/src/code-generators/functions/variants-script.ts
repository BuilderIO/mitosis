export const variantsScript = (variantsString: string, contentId: string) =>
  `
(function() {
  if (window.builderNoTrack) {
    return;
  }
  
  var variants = ${variantsString};
  function removeVariants() {
    variants.forEach((template) => {
      document.querySelector('template[data-template-variant-id="' + template.id + '"]').remove();
    });
  }

  if (typeof document.createElement("template").content === 'undefined') {
    removeVariants();
    return ;
  }

  function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/" + "; Secure; SameSite=None";
  }

  function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }
  var cookieName = 'builder.tests.${contentId}';
  var variantInCookie = getCookie(cookieName);
  var availableIDs = variants.map(function(vr) { return vr.id }).concat('${contentId}');
  var variantId;
  if (availableIDs.indexOf(variantInCookie) > -1) {
    variantId = variantInCookie;
  }

  if (!variantId) {
    var n = 0;
    var set = false;
    var random = Math.random();
    for (var i = 0; i < variants.length; i++) {
      var variant = variants[i];
      var testRatio = variant.testRatio;
      n += testRatio;
      if (random < n) {
        setCookie(cookieName, variant.id);
        variantId = variant.id;
        break;
      }
    }
    if (!variantId) {
      variantId = "${contentId}";
      setCookie(cookieName, "${contentId}");
    }
  }
  if (variantId && variantId !== "${contentId}") {
    var winningTemplate = document.querySelector('template[data-template-variant-id="' + variantId + '"]');
    if (winningTemplate) {
      var parentNode = winningTemplate.parentNode;
      var newParent = parentNode.cloneNode(false);
      newParent.appendChild(winningTemplate.content.firstChild);
      parentNode.parentNode.replaceChild(newParent, parentNode);
    }
  } else if (variants.length > 0) {
    removeVariants();
  }
})()`.replace(/\s+/g, ' ');
