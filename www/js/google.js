function googlelogin() {

    window.plugins.GooglePlus.login({
            'scopes': 'https://www.googleapis.com/auth/drive.file profile',
            'offline': true,
            'webApiKey': 'com.googleusercontent.apps.'
        },
        function (obj) {
            $scope.$apply(function () {
                $scope.srcImage = obj.imageUrl;
                $scope.NomeGoogle = obj.displayName;
            });


            var data = $.param({
                client_id: '',
                client_secret: '',
                grant_type: 'authorization_code',
                code: obj.serverAuthCode
            });

            var config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                }
            }

            $http.post("https://www.googleapis.com/oauth2/v3/token", data, config).success(function (data, status) {
                    //data.access_token;

                    /** from now you can do use of google API **/

                })
                .error(function (data, status) {
                    console.log(data);
                    console.log(status);
                });

        },
        function (msg) {
            alert('Erro');
            alert('error: ' + msg);
        }
    );
}
