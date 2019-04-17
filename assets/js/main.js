var sectionHeight = function() {
  var total    = $(window).height(),
      $section = $('section').css('height','auto');

  if ($section.outerHeight(true) < total) {
    var margin = $section.outerHeight(true) - $section.height();
    $section.height(total - margin - 20);
  } else {
    $section.css('height','auto');
  }
}

function navigateToId(idExpression, instant) {
  var elements = $(idExpression);
  if (elements.length == 0) {
      elements = $('[name="' + idExpression.substring(1) + '"]');
      if (elements.length == 0) {
        return;
      }
  }
  var offset = $("#banner").is(":visible") ? 140 : 10;
  var position = elements.offset().top - offset;
  if (instant) {
    window.scrollTo(0, position);
  } else {
    $("html, body").animate({scrollTop: position}, 400);
  }
}

function navigateToHash(instant) {
  var hash = document.location.hash;
  if (hash && hash.length > 0) {
    navigateToId(hash, instant);
  }
}

$(window).resize(sectionHeight);

$(function() {
  $("section h1, section h2").each(function(){
    $("nav ul").append("<li class='tag-" + this.nodeName.toLowerCase() + "'><a href='#" + $(this).text().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g,'') + "'>" + $(this).text() + "</a></li>");
    $(this).attr("id",$(this).text().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g,''));
    $("nav ul li:first-child a").parent().addClass("active");
  });

  $('nav ul li').on("click", "a", function(event) {
    navigateToId($(this).attr("href"));
    event.preventDefault();
    $("nav ul li a").parent().removeClass("active");
    $(this).parent().addClass("active");
  });

  $('section a[href^="#"]').on("click", function(event) {
    var href = navigateToId($(this).attr("href"));
    event.preventDefault();
  });

  sectionHeight();

  $('img').on('load', sectionHeight);

  if (!window.performance || window.performance.navigation.type == 0) {
    navigateToHash(true);
  }
  $(window).on("hashchange", function(event) {
    navigateToHash(true);
    event.preventDefault();
  });
});
