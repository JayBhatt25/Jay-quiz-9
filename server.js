const  express = require('express');
const app = express();
const port = 3000;
const axios = require('axios').default;
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const {body,check,validationResult} = require('express-validator');
const options = {
        swaggerDefinition: {
                info:{
                        title: 'Assignment 8 API',
                        version: '1.0.0',
                        description: 'Documentation of all the endpoints for Assignment 8'
                },
                host: '147.182.219.97:3000',
                basePath: '/'
        },
        apis: ['./server.js'],
}

const specs = swaggerJsdoc(options);
app.use(cors());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
const mariadb = require('mariadb');
const pool = mariadb.createPool({
        host:'localhost',
        user:'root',
        password:'root',
        database:'sample',
        port:3306,
        connectionLimit:10
});


app.use(express.json());

/**
 * @swagger
 * /agents/bangalore:
 *     get:
 *       tags:
 *         - Agents
 *       description: Return all agents from bangalore
 *       produces:
 *        - application/json
 *       responses:
 *          200:
 *               description: Object containing array of agents residing in bangalore
 */
app.get('/agents/bangalore',(req, res)=> {
        pool.getConnection()
        .then(conn => {
                conn.query("SELECT * FROM agents WHERE WORKING_AREA = 'Bangalore'")
                .then((rows) => {
                        res.set('Content-Type', 'text/json');
                        res.json(rows);
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

/**
 * @swagger
 * /customers/orders:
 *     get:
 *       tags:
 *         - Customers
 *       description: Returns all the customers and their orders
 *       produces:
 *        - application/json
 *       responses:
 *          200:
 *               description: Object containing array of all the customers and their orders.
 */
app.get('/customers/orders', (req, res)=> {
        // Fetches which customer ordered food of what amount on what date.
        pool.getConnection()
        .then(conn => {
                conn.query("SELECT daysorder.ORD_AMOUNT, daysorder.ORD_DATE,customer.CUST_NAME FROM customer INNER JOIN daysorder ON customer.CUST_CODE = daysorder.CUST_CODE")
                .then((rows) => {
                        res.set('Content-Type', 'text/json');
                        res.json(rows)
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

/**
 * @swagger
 * /students:
 *     get:
 *       tags:
 *         - Students
 *       description: Returns details of all the students.
 *       produces:
 *        - application/json
 *       responses:
 *          200:
 *               description: Object containing array of all the details of each student.
 */
 app.get('/students', (req, res) => {
        pool.getConnection()
        .then( conn => {
                conn.query("SELECT * FROM student")
                .then((rows)=> {
                        res.json(rows)
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
})

/**
 * @swagger
 * /students/reports:
 *     get:
 *       tags:
 *         - Students
 *       description: Returns all the reports of the students
 *       produces:
 *        - application/json
 *       responses:
 *          200:
 *               description: Object containing array of all the reports.
 */
app.get('/students/reports', (req, res) => {
        pool.getConnection()
        .then(conn => {
                conn.query("SELECT student.NAME, studentreport.CLASS, studentreport.GRADE, studentreport.SEMISTER FROM student INNER JOIN studentreport ON student.ROLLID = studentreport.ROLLID")
                .then((rows) => {
                        res.set('Content-Type', 'text/json');
                        res.json(rows)
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
});

/**
 * @swagger
 * /students:
 *     post:
 *       tags:
 *         - Students
 *       consumes:
 *        - application/json
 *       parameters:
 *        - in: body
 *          name: student
 *          description: The student to create.
 *          schema:
 *            type: Object
 *            required:
 *              - name
 *              - title
 *              - class
 *              - section
 *              - rollid
 *            properties:
 *              name:
 *               type: string
 *              title:
 *               type: string
 *              class:
 *               type: string
 *              section:
 *               type: string
 *              rollid:
 *               type: integer
 *       responses:
 *          201:
 *               description: Created.
 *          400:
 *               description: Invaild Syntax. Returns Array of errors.
 */

const valNsan = [ 
        check('name').trim().not().isEmpty().withMessage('name cannot be empty'),
        check('name').trim().matches(/^[A-Za-z\s]+$/).withMessage('name cannot have numbers in it.'),
        check('title').trim().not().isEmpty().withMessage('title cannot be empty'),
        check('title').trim().matches(/^[A-Za-z\s]+$/).withMessage('title cannot have numbers in it.'),
        check('section').trim().matches(/^[A-Za-z\s]+$/).isLength({max:1}).withMessage('Section can only be an alphabet and of length 1'),
        check('rollid').not().isEmpty().withMessage('rollid cannot be empty'),
        check('rollid').isNumeric().withMessage('rollid needs to be numeric')
        ];
app.post('/students', valNsan,(req, res) => {
	const errors = validationResult(req);
	if(!errors.isEmpty()){
	return res.status(400).jsonp(errors.array());
	}
        const newStudent = req.body;
        let name= newStudent.name;
        let title = newStudent.title;
        let sclass = newStudent.class;
        let section = newStudent.section;
        let rollid = newStudent.rollid;
        pool.getConnection()
        .then(conn => {
                conn.query(`INSERT INTO student VALUES \('${name}','${title}','${sclass}', '${section}', '${rollid}'\)`)
                .then(result => res.send("Success"))
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
});


/**
 * @swagger
 * /students:
 *     put:
 *       tags:
 *         - Students
 *       consumes:
 *        - application/json
 *       parameters:
 *        - in: body
 *          name: student
 *          description: The student to update or create.
 *          schema:
 *            type: Object
 *            required:
 *              - name
 *              - title
 *              - class
 *              - section
 *              - rollid
 *            properties:
 *              name:
 *               type: string
 *              title:
 *               type: string
 *              class:
 *               type: string
 *              section:
 *               type: string
 *              rollid:
 *               type: integer
 *       responses:
 *          200:
 *               description: Updated if student exists.
 *          201:
 *               description: Created if student not found.
 *          400:
 *               description: Invaild Syntax. Returns Array of errors.
 */
app.put('/students', valNsan,(req, res) => {
        const student = req.body;
        const errors = validationResult(req);
	if(!errors.isEmpty()){
	return res.status(400).jsonp(errors.array());
	}
        pool.getConnection()
        .then(conn => {
		conn.query(`SELECT 1 FROM student WHERE ROLLID=${student.rollid}`)
		.then( result => {
			if(result.length == 0){
				conn.query(`INSERT into student VALUES('${student.name}', '${student.title}', '${student.section}', '${student.section}', '${student.rollid}')`)
				.then( created => {
					res.status(201);
					res.send("Created");
				})
				.catch(err=> console.log(err))
			}
                	conn.query(`UPDATE student SET ROLLID = '${student.rollid}', NAME = '${student.name}', TITLE = '${student.title}', SECTION = '${student.section}' WHERE ROLLID = '${student.rollid}'`)
                	.then(result => res.send("Success"))
                	.catch(err=> console.log(err))
		})
	.catch(err=>console.log(err))
        })
	 .catch(err => console.log(err))
})

app.get('/', (req, res) => {
        res.set('Content-Type', 'text/plain');
        res.send("Go to one of the get requests");
});


/**
 * @swagger
 * /student/{rollid}:
 *     delete:
 *       tags:
 *         - Students
 *       parameters:
 *        - in: path
 *          name: rollid
 *          description: Delete student.
 *          schema:
 *            type: string
 *            required: true
 *            description: string rollid of the student to delete.
 *       responses:
 *          200:
 *               description: Student that was deleted.
 *          404:
 *               description: Student not found.
 */
app.delete('/student/:id',(req, res)=> {
        let stuID = req.params.id;
        pool.getConnection()
        .then((conn)=> {
		conn.query(`SELECT 1 FROM student WHERE ROLLID = ${stuID}`)
		.then( result => {
			console.log(result);
			if(result.length == 0){
				res.status(404);
				res.send("Student not found.");
			}
               		 conn.query(`DELETE FROM student WHERE ROLLID = ${stuID}`)
               		 .then(result => res.send("Success"))
               		 .catch(err => console.log(err))
		})
		.catch(err => console.log(err))
        .catch(err => console.log(err.message))

        })
});

/**
 * @swagger
 * /students:
 *     patch:
 *       tags:
 *         - Students
 *       consumes:
 *        - application/json
 *       parameters:
 *        - in: body
 *          name: student
 *          description: The student to update.
 *          schema:
 *            type: Object
 *            required:
 *              - name
 *              - title
 *              - class
 *              - section
 *              - rollid
 *            properties:
 *              name:
 *               type: string
 *              title:
 *               type: string
 *              class:
 *               type: string
 *              section:
 *               type: string
 *              rollid:
 *               type: integer
 *       responses:
 *          200:
 *               description: Updated student.
 *          404:
 *               description: Student not found.
 *          400:
 *               description: Invaild Syntax. Returns Array of errors.
 */
app.patch('/students', valNsan,(req, res) => {
        const student = req.body;
        const errors = validationResult(req);
	if(!errors.isEmpty()){
	return res.status(400).jsonp(errors.array());
	}
        pool.getConnection()
        .then( conn => {
                conn.query(`SELECT 1 FROM student WHERE ROLLID=${student.rollid}`)
		.then(result => {
			if(result.length == 0){
				res.status(404);
				res.send("Student not found");
			}
               		 conn.query(`UPDATE student SET ROLLID = '${student.rollid}', NAME = '${student.name}', TITLE = '${student.title}', SECTION = '${student.section}' WHERE ROLLID = '${student.rollid}'`)
               		 .then(result => res.send("Success"))
               		 .catch(err => console.log(err))
		})
	.catch(err => console.log(err))
        })
        .catch(err => console.log(err))
})

app.get('/say', (req, res) => {
    const axios_url = `https://assgn9-64twckki.ue.gateway.dev/hello?keyword=${req.query.keyword}`
    axios.get(axios_url)
    .then(result => {
        res.status(200).send(result.data);
    })
    .catch(err => {
	console.log(err);
	})
})

app.listen(port, ()=> {
        console.log(`Example app listening at http://localhost:${port}`);
});
