const ctx = document.getElementById('chart1').getContext('2d'),
      ctx1 = document.getElementById('chart2').getContext('2d'),
      ctx2 =   document.getElementById('chart3').getContext('2d');
let myChart1 = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['fille', 'garçon'],
        datasets: [{
            data: [200, 10],
            backgroundColor: [
                'rgb(229, 0, 91)',
                'rgb(0, 161, 221)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1.2
        }]
    },
});
let myChart2 = new Chart(ctx1, {
    type: 'bar',
    data: {
        labels: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'décembre'],
        datasets: [{
            label: "",
            data: [200, 10, 50, 59, 100, 5, 6],
            backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(255, 159, 64, 0.5)',
                'rgba(255, 205, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(201, 203, 207, 0.5)'
            ],
            borderWidth: 1.2
        }]
    },
});
// let classe_arr = [];
// let len = <%=nbr_classe%>;
// for(let i=1;i<nbr_classe+1;i++)
//     classe_arr[i] = 'classe '+i;
// let x = JSON.stringify(<%=nbr_classe%>);
let myChart3 = new Chart(ctx2, {
    type: 'bar',
    data: {
        labels: x,
        datasets: [{
            data: [200, 10],
            backgroundColor: [
                'rgb(229, 0, 91)',
                'rgb(0, 161, 221)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1.2
        }]
    },
});