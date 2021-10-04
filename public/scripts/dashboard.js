$(document).ready(function () {
    $('#close-modal').click(()=>{
      $('.modal').css("visibility", "hidden");
    });
    $('.click').click(function () {
        $('.ul-test').slideToggle();
    });
    $('.click1').click(function () {
      $('.ul-test1').slideToggle();
    });
    $('.click2').click(function () {
      $('.ul-test2').slideToggle();
    });
    $('.click3').click(function () {
      $('.ul-test3').slideToggle();
    });
    $('.click4').click(function () {
      $('.ul-test4').slideToggle();
    });
    $('.logo-details').click(()=>{
      $('.sidebar').toggle('slide');
      // $('.logo-details').css('border-bottom-right-radius', '20px');
    });
    $('.sidebar').hover(()=>{
      $('.sidebar').css('opacity', '1');
    });
  });
  