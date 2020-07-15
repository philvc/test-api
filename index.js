const express = require('express');
const app = express();
const port = 3000;
const multipart = require('connect-multiparty');

const multipartMiddleware = multipart({ uploadDir: './images' });

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
const cors = require('cors')

const path = require('path')
const fs = require('fs');


app.use(cors())

app.post('/api/upload', multipartMiddleware, async (request, response) => {
    response.json({
        message: 'file uploaded'
    })

})

app.get('/api/images', async (request, response) => {


    const dir = path.join(__dirname, 'images')

    const files = fs.readdirSync(dir, (error, files) => {
        if (error) {
            return console.log(`Unable to get files from dir=${dir}`)
        }


        return files
    })

    const filesWithDate = await Promise.all(

        files.map(async file => {

            const dir = path.join(__dirname, `images/${file}`)

            let creationDate;

            await new Promise((resolve, reject) => {

                fs.stat(dir, (error, stats) => {
                    if (error) {
                        return console.log(`Unable to get file details from dir=${path}`);
                    }

                    resolve(stats.birthtimeMs)
                })

            }).then(date => creationDate = date)

            return {
                file,
                creationDate,
            }
        })
    )

    const sortedFiles = filesWithDate.sort((a, b) => b.creationDate - a.creationDate).map(file => file.file)

    response.send({
        urls: sortedFiles
    })
})
app.get('/api/image/:name', function (request, response, next) {

    const fileName = request.params.name;

    const dir = path.join(__dirname, `images/${fileName}`)

    response.sendFile(dir, function (err) { /* ... */ });
})

app.listen(port, (err) => {

    if (err) {
        throw new Error('Something bad happened...');
    }

    console.log(`Server is listening on ${port}`);
});
