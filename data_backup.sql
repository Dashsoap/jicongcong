PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO User VALUES('cme72pyir0000gjrl4eye3axu','demo@example.com','演示用户','STUDENT',1754914396419);
INSERT INTO User VALUES('cme72pyiw0001gjrl4vqi0aak','teacher@example.com','演示老师','TEACHER',1754914396424);
INSERT INTO User VALUES('test-elo-user','test-elo@example.com','精准ELO测试用户','STUDENT',1756536322569);
CREATE TABLE IF NOT EXISTS "Classroom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO Classroom VALUES('cme72pyj20008gjrlsypnfhh0','七年级一班',1754914396431);
CREATE TABLE IF NOT EXISTS "Enrollment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "roleInClass" TEXT NOT NULL DEFAULT 'student',
    CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO Enrollment VALUES('cme72pyj3000agjrlw7j6zixw','cme72pyir0000gjrl4eye3axu','cme72pyj20008gjrlsypnfhh0','student');
INSERT INTO Enrollment VALUES('cme72pyj5000cgjrlkdrfwwao','cme72pyiw0001gjrl4vqi0aak','cme72pyj20008gjrlsypnfhh0','teacher');
CREATE TABLE IF NOT EXISTS "Concept" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO Concept VALUES('cme72pyiy0002gjrlnmpjwm3x','数学','代数基础','高一',3);
INSERT INTO Concept VALUES('cme72pyiz0003gjrl3jqyi1ue','数学','力学基础','高一',2);
INSERT INTO Concept VALUES('concept-function-basic','数学','函数基本概念','高一',5);
INSERT INTO Concept VALUES('concept-function-monotone','数学','函数单调性','高一',4);
INSERT INTO Concept VALUES('concept-quadratic','数学','二次函数','高一',5);
INSERT INTO Concept VALUES('concept-inequality','数学','不等式','高一',4);
INSERT INTO Concept VALUES('concept-exponential','数学','指数函数','高一',4);
INSERT INTO Concept VALUES('concept-logarithm','数学','对数函数','高一',4);
INSERT INTO Concept VALUES('concept-trigonometry','数学','三角函数','高一',5);
INSERT INTO Concept VALUES('concept-vector','数学','向量','高一',3);
CREATE TABLE IF NOT EXISTS "Attempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "timeMs" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attempt_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO Attempt VALUES('cmexx1o61000qgjdhlm43n6vs','cme72pyir0000gjrl4eye3axu','cmexwwnot0007gj2n3la7p15q',1,7122,1756537451929);
INSERT INTO Attempt VALUES('cmexx1ppq000tgjdhgaq7t7p4','cme72pyir0000gjrl4eye3axu','cmexwwnov000fgj2nh2v35wnn',1,2234,1756537453934);
INSERT INTO Attempt VALUES('cmexx1sck000wgjdh729cm33p','cme72pyir0000gjrl4eye3axu','cmexwwnou000bgj2nu779tyxz',1,3414,1756537457348);
INSERT INTO Attempt VALUES('cmexx1szk000zgjdhs193l452','cme72pyir0000gjrl4eye3axu','cmexwwnou0009gj2nina380da',1,818,1756537458177);
INSERT INTO Attempt VALUES('cmexx1tnz0012gjdh9bogbbc6','cme72pyir0000gjrl4eye3axu','cmexwwnov000dgj2nc7ifbgkm',1,859,1756537459056);
INSERT INTO Attempt VALUES('cmexx1uj40015gjdhzork1w67','cme72pyir0000gjrl4eye3axu','cmexwwnov000dgj2nc7ifbgkm',1,1978,1756537460176);
INSERT INTO Attempt VALUES('cmexx1v3o0018gjdhu8u69tbj','cme72pyir0000gjrl4eye3axu','cmexwwnov000dgj2nc7ifbgkm',1,2719,1756537460916);
INSERT INTO Attempt VALUES('cmexx1vfc001bgjdhxd9h7ori','cme72pyir0000gjrl4eye3axu','cmexwwnov000dgj2nc7ifbgkm',1,3149,1756537461336);
INSERT INTO Attempt VALUES('cmexx1vod001egjdh2c4xqrft','cme72pyir0000gjrl4eye3axu','cmexwwnov000dgj2nc7ifbgkm',1,3464,1756537461661);
INSERT INTO Attempt VALUES('cmexx1vws001hgjdha5u228ua','cme72pyir0000gjrl4eye3axu','cmexwwnov000dgj2nc7ifbgkm',1,3784,1756537461964);
INSERT INTO Attempt VALUES('cmexxnilq0024gjdh1p4fiihp','cme72pyir0000gjrl4eye3axu','cmexwwnoo0001gj2no0a8b7xj',1,13062,1756538471151);
CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subject" TEXT,
    "grade" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO Conversation VALUES('f9520346-a9a5-48f2-8e5c-91f74328ffb4','cme72pyir0000gjrl4eye3axu','数学','高一',1754928544831);
INSERT INTO Conversation VALUES('a965a540-0f86-4339-953a-6cb17fe91c81','cme72pyir0000gjrl4eye3axu','数学','高一',1754964052135);
INSERT INTO Conversation VALUES('1aa0ae80-4b2d-4dc9-aabb-0ccc8bae936b','cme72pyir0000gjrl4eye3axu','数学','高一',1754964074361);
INSERT INTO Conversation VALUES('2532c8ee-2325-4792-af5f-4edff5e3af32','cme72pyir0000gjrl4eye3axu','数学','高一',1754964147506);
INSERT INTO Conversation VALUES('a2d06cd8-b377-468c-9a64-045589d2083f','cme72pyir0000gjrl4eye3axu','数学','高一',1754964196614);
INSERT INTO Conversation VALUES('ed5180f5-631e-4a9e-8bd3-7f262d945b1d','cme72pyir0000gjrl4eye3axu','数学','高一',1754964344893);
INSERT INTO Conversation VALUES('d2951271-c1a3-4856-b721-a37414c610cf','cme72pyir0000gjrl4eye3axu','数学','高一',1754964389697);
INSERT INTO Conversation VALUES('62b3db74-809f-4273-bcda-e952ef52f616','cme72pyir0000gjrl4eye3axu','数学','高一',1754964537824);
INSERT INTO Conversation VALUES('465a38d8-c10a-4947-98dd-00d8ee0ce9b6','cme72pyir0000gjrl4eye3axu','数学','高一',1754968263927);
INSERT INTO Conversation VALUES('980db88e-b9b6-45a8-9c8a-16e786a7fb19','cme72pyir0000gjrl4eye3axu','数学','高一',1754969356881);
CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "meta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO Message VALUES('cme7b57ib000jgjfjo5xyrgjb','f9520346-a9a5-48f2-8e5c-91f74328ffb4','user','你好',NULL,1754928544836);
INSERT INTO Message VALUES('cme7b57id000lgjfj0l5dgh7c','f9520346-a9a5-48f2-8e5c-91f74328ffb4','assistant','你好，请问有什么数学问题我可以帮忙解答的吗？','{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":321,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.0001605","completion_tokens":24,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.000036","total_tokens":345,"total_price":"0.0001965","currency":"USD","latency":0.02198820374906063}}',1754928544838);
INSERT INTO Message VALUES('cme7wa949000qgjfj6cfpoqmr','a965a540-0f86-4339-953a-6cb17fe91c81','user','111',NULL,1754964052137);
INSERT INTO Message VALUES('cme7wa94a000sgjfjbcgn6tpk','a965a540-0f86-4339-953a-6cb17fe91c81','assistant','抱歉，请问你需要关于什么内容的数学的帮助？','{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":320,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.00016","completion_tokens":26,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.000039","total_tokens":346,"total_price":"0.000199","currency":"USD","latency":0.4252129120286554}}',1754964052139);
INSERT INTO Message VALUES('cme7waq9n000wgjfjlekm7khf','1aa0ae80-4b2d-4dc9-aabb-0ccc8bae936b','user','2x+1>5 的答案是什么?',NULL,1754964074364);
INSERT INTO Message VALUES('cme7waq9p000ygjfj2nzcfumu','1aa0ae80-4b2d-4dc9-aabb-0ccc8bae936b','assistant',replace('【解题思路】\n要解不等式 \(2x + 1 > 5\)，我们需要将 x 的解表示出来。\n\n【步骤】\n1. 首先，将不等式 \(2x + 1 > 5\) 转化为等式 \(2x + 1 = 5\)，即 \(2x = 4\)。\n2. 然后，将等式 \(2x = 4\) 求解得到 x = 2。\n\n【答案】\n不等式 \(2x + 1 > 5\) 的解为 x > 2。\n\n【易错点/检查】\n在计算过程中，要注意不等式的符号变化，确保计算准确无误。\n\n【参考资料】\n无。','\n',char(10)),'{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":334,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.000167","completion_tokens":189,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.0002835","total_tokens":523,"total_price":"0.0004505","currency":"USD","latency":0.47980266623198986}}',1754964074365);
INSERT INTO Message VALUES('cme7wcapg0012gjfj4vlp0m5f','2532c8ee-2325-4792-af5f-4edff5e3af32','user','共轭双曲线怎么定义?',NULL,1754964147508);
INSERT INTO Message VALUES('cme7wcapi0014gjfjaztkuh24','2532c8ee-2325-4792-af5f-4edff5e3af32','assistant',replace('\n【解题思路】\n共轭双曲线是平面上的一种特殊曲线，它的定义通过几何性质或者学方程来描述。\n\n【步骤】\n1. **几何定义：** 共轭双曲线是平面上两条互相共轭的双曲线。即，对于平面上的两条双曲线，它们的渐近线（无限远处的曲线）互相垂直，且互为渐近线的交点在无穷远处。两条双曲线的渐近线一共有四条，两两互相垂直。\n\n2. **数学方程定义：** 共轭双曲线可以通过以下方程来描述：\n   - 第一种形式：$\frac{x^2}{a^2} - \frac{y^2}{b^2} = 1$ 和 $\frac{x^2}{b^2} - \frac{y^2}{a^2} = 1$，其中 $a$ 和 $b$ 为正实数。\n   - 第二种形式：$y^2 - x^2 = a^2 - b^2$ 和 $y^2 - x^2 = b^2 - a^2$，其中 $a$ 和 $b$ 为正实数。\n\n3. **特点：** 共轭双曲线的焦点在坐标原点附近，开口朝向 $x$ 轴和 $y$ 轴。\n\n【答案】\n共轭双曲线的定义可以通过几何性质和数学方程两种方式来描述，其中数学方程是最常见的表达方式。\n\n【易错点/检查】\n- 注意区分共轭双曲线和普通双曲线的性质和定义。\n- 理解共轭双曲线的特点和数学方程的表达形式。\n\n【参考','\n',char(10)),'{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":332,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.000166","completion_tokens":512,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.000768","total_tokens":844,"total_price":"0.000934","currency":"USD","latency":0.009195139165967703}}',1754964147510);
INSERT INTO Message VALUES('cme7wdclk0018gjfj5ni932u9','a2d06cd8-b377-468c-9a64-045589d2083f','user','你没说完',NULL,1754964196616);
INSERT INTO Message VALUES('cme7wdclm001agjfjacs09oqb','a2d06cd8-b377-468c-9a64-045589d2083f','assistant','非常抱歉！请问有什么数学问题我可以帮你解呢？','{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":323,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.0001615","completion_tokens":27,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.0000405","total_tokens":350,"total_price":"0.000202","currency":"USD","latency":0.26408851495943964}}',1754964196618);
INSERT INTO Message VALUES('cme7wgj0f001fgjfji39n7r5o','ed5180f5-631e-4a9e-8bd3-7f262d945b1d','user','你好呀',NULL,1754964344896);
INSERT INTO Message VALUES('cme7wgj0h001hgjfjn19oaty1','ed5180f5-631e-4a9e-8bd3-7f262d945b1d','assistant','你好！有什么数学问题我可以帮忙解答呢？','{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":323,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.0001615","completion_tokens":22,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.000033","total_tokens":345,"total_price":"0.0001945","currency":"USD","latency":0.041676206048578024}}',1754964344898);
INSERT INTO Message VALUES('cme7wgupn001lgjfjzr41yk2k','ed5180f5-631e-4a9e-8bd3-7f262d945b1d','user','共轭双曲线是什么?》',NULL,1754964360059);
INSERT INTO Message VALUES('cme7wgupp001ngjfjps1ppjb9','ed5180f5-631e-4a9e-8bd3-7f262d945b1d','assistant',replace('**解题思路**\n共轭双曲线是平面上的两个相交曲线它们关于两个相互垂直的直径对称。共轭双曲线的定义类似于椭圆和双曲线的定义，只不过共轭双曲线的离心率是负数。\n\n**步骤**\n1. 共轭双曲线的标准方程为：$\frac{x^2}{a^2} - \frac{y^2}{b^2} = 1$，其中 $a$ 和 $b$ 分别为横轴和纵轴的长度。\n2. 共轭双曲线的离心率定义为：$e = \sqrt{1 + \frac{b^2}{a^2}}$，注意离心率是负数。\n3. 共轭双曲线的焦点到中心的距离为 $c = \sqrt{a^2 + b^2}$。\n\n**答案**\n共轭双曲线是平面上的两个相交曲线，关于两个相互垂直的直径对称，其标准方程为 $\frac{x^2}{a^2} - \frac{y^2}{b^2} = 1$。\n\n**易错点/检查**\n- 计算离心率时要注意负号。\n- 确保标准方程中横轴和纵轴的位置正确。\n\n**参考资料**\n- 高中数学教材','\n',char(10)),'{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":367,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.0001835","completion_tokens":402,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.000603","total_tokens":769,"total_price":"0.0007865","currency":"USD","latency":0.2686136970296502}}',1754964360061);
INSERT INTO Message VALUES('cme7wh37m001qgjfj317hwf49','ed5180f5-631e-4a9e-8bd3-7f262d945b1d','user','给我出个题再',NULL,1754964371074);
INSERT INTO Message VALUES('cme7wh37p001sgjfjo0a7dvv3','ed5180f5-631e-4a9e-8bd3-7f262d945b1d','assistant','抱歉，我并不具备生成题目的能力。如果你有任何数学需要解答者需要帮理解某个数学概念，请随时告诉我，我会尽力帮助你的。','{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":783,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.0003915","completion_tokens":68,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.000102","total_tokens":851,"total_price":"0.0004935","currency":"USD","latency":0.29392467252910137}}',1754964371077);
INSERT INTO Message VALUES('cme7whhl0001vgjfjd5mcf9rs','d2951271-c1a3-4856-b721-a37414c610cf','user','共轭双曲线',NULL,1754964389700);
INSERT INTO Message VALUES('cme7whhl2001xgjfj2l095drl','d2951271-c1a3-4856-b721-a37414c610cf','assistant',replace('**解题思路**\n共轭双曲线是平面上的一类曲线，具有特定的几何性质可以通过方程的形式来描述。在解题时，我们首先需要了解共轭双曲线的定义和性质，然后根据具体的题目要求来进行分析和求解。\n\n**步骤**\n1. 确定共轭双曲线的标准方程为：$\frac{x^2}{a^2} - \frac{y^2}{b^2} = 1$。\n2. 判断给出的方程是否符合共轭双曲线的标准方程形式。如果是标准形式，可以直接判断是共轭双曲线；如果不是标准形式，需要进行适当的变换，使其符合标准形式。\n3. 根据方程中的参数$a$和$b$的值，可以确定共轭双曲线的具体形状和位置。\n4. 根据题目要求，进行相应的计算和分析，得出结论。\n\n**答案**\n根据具体的题目内容，给出对共轭双曲线的相关描述和结论。\n\n**易错点/检查**\n- 确认方程是否符合共轭双曲线的标准形式。\n- 注意计算过程中的代数运算和符号使用。\n\n**参考资料**\n- 《高中数学》\n- [共轭双曲线 - 百度百科](https://baike.baidu.com/item/%E5%85%B1%E8%BD%AD%E5%8F%8C%E6%9B%B2%E7%BA%BF)','\n',char(10)),'{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":327,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.0001635","completion_tokens":448,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.000672","total_tokens":775,"total_price":"0.0008355","currency":"USD","latency":1.1943382360041142}}',1754964389702);
INSERT INTO Message VALUES('cme7whpfv0021gjfjqi2hptk5','d2951271-c1a3-4856-b721-a37414c610cf','user','具体例题有吗',NULL,1754964399884);
INSERT INTO Message VALUES('cme7whpfy0023gjfjc01nr8s8','d2951271-c1a3-4856-b721-a37414c610cf','assistant','我不确定。请问有什么具体的题目需要解答吗？我可以根据具体的题内容给出相应的解题步骤和答案。','{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":790,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.000395","completion_tokens":49,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.0000735","total_tokens":839,"total_price":"0.0004685","currency":"USD","latency":0.39462659298442304}}',1754964399886);
INSERT INTO Message VALUES('cme7wknvn0027gjfj6xceqgqg','62b3db74-809f-4273-bcda-e952ef52f616','user','解题思路是什么?',NULL,1754964537827);
INSERT INTO Message VALUES('cme7wknvo0029gjfjyjqhug8m','62b3db74-809f-4273-bcda-e952ef52f616','assistant','对不起，我需要更多的信息才能为您提供解题思路。请提供具体的题目或问题，我会尽力帮助您解答。','{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":328,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.000164","completion_tokens":47,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.0000705","total_tokens":375,"total_price":"0.0002345","currency":"USD","latency":0.3319159559905529}}',1754964537829);
INSERT INTO Message VALUES('cme7ysiyl002dgjfjnl9tw7ym','465a38d8-c10a-4947-98dd-00d8ee0ce9b6','user','共轭双曲线的解法?',NULL,1754968263933);
INSERT INTO Message VALUES('cme7ysiyn002fgjfj5454ebsv','465a38d8-c10a-4947-98dd-00d8ee0ce9b6','assistant',replace('## 解题思路\n共轭双曲线是二次函数的图像，其定义方程一般为 $\dfrac{x^2}{a^2} - \dfrac{y^2}{b^2} = 1$ 或 $\dfrac{y^2}{b^2} - \dfrac{x^2}{a^2} = 1$。我们可以通过一些特征来确定共轭双曲线的性质和图像。\n\n## 步骤\n1. 确定方程形式：根据方程的形式确定是哪种共轭双曲线。\n2. 确定中心和焦点：找出中心和焦点的坐标。\n3. 确定长轴和短轴：根据方程中的参数确定长轴和短轴的长度。\n4. 绘制图像：根据以上信息绘制共轭双曲线的图像。\n\n## 答案\n待定\n\n## 易错点/检查\n- 方程形式是否正确确定。\n- 中心和焦点的坐标计算是否准确。\n- 长轴和短轴的长度是否正确计算。\n\n## 参考资料\n- [共轭双曲线 - 百度百科](https://baike.baidu.com/item/%E5%85%B1%E8%BD%AD%E5%8F%8C%E6%9B%B2%E7%BA%BF)','\n',char(10)),'{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":331,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.0001655","completion_tokens":376,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.000564","total_tokens":707,"total_price":"0.0007295","currency":"USD","latency":0.24679701309651136}}',1754968263935);
INSERT INTO Message VALUES('cme7yvlfy002jgjfjqjklss8x','465a38d8-c10a-4947-98dd-00d8ee0ce9b6','user','例题有吗?',NULL,1754968407118);
INSERT INTO Message VALUES('cme7yvlg2002lgjfjia4nkn3g','465a38d8-c10a-4947-98dd-00d8ee0ce9b6','assistant','我不确定。如果你能提供具体的共轭双曲线的方程或题目，我可以帮你解答这个例题。','{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":721,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.0003605","completion_tokens":40,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.00006","total_tokens":761,"total_price":"0.0004205","currency":"USD","latency":0.14241404691711068}}',1754968407123);
INSERT INTO Message VALUES('cme7zai9h003mgjfj0q6uni3o','465a38d8-c10a-4947-98dd-00d8ee0ce9b6','user','你给我想一个例题',NULL,1754969102837);
INSERT INTO Message VALUES('cme7zai9j003ogjfjb7yun5t6','465a38d8-c10a-4947-98dd-00d8ee0ce9b6','assistant',replace('好的，我为你设计一个例题：\n\n设共轭双曲线的方程为 $\dfrac{x^2}{4} - \dfrac{y^2}{9} = 1$，请按照步骤解题，找出该共轭双曲线的中心、焦点、长轴、短轴，并绘制出图像。','\n',char(10)),'{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":777,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.0003885","completion_tokens":96,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.000144","total_tokens":873,"total_price":"0.0005325","currency":"USD","latency":0.18610474094748497}}',1754969102839);
INSERT INTO Message VALUES('cme7zfyac004bgjfjg9s77jso','980db88e-b9b6-45a8-9c8a-16e786a7fb19','user','我想知道什么是对数函数',NULL,1754969356884);
INSERT INTO Message VALUES('cme7zfyae004dgjfjzh9bh6fd','980db88e-b9b6-45a8-9c8a-16e786a7fb19','assistant',replace('【解题思路】\012对数函数是指以一个固定的正数为底数的对数函数，通常用 $\log_a x$ 表示，其中 $a$ 为底数，$x$ 为真数。对数函数可以帮助我们解决指数函数的反问题。\012\012【步骤】\012对数函数的定义：\012- 如果 $a > 0$ 且 $a \neq 1$，那么对于任意正实数 $x$，$\log_a x = y$ 当且仅当 $a^y = x$。\012- 当 $a = 10$ 时，常用的对数函数是以 10 为底的常用对数函数 $\log x$，即 $\log x = y$ 当且仅当 $10^y = x$。\012\012【答案】\012对数函数是以一个固定的正数为底数的对数函数，通常用 $\log_a x$ 表示。\012\012【易错点/检查】\012- 对数函数的底数不能为0或负数，且不能为1。\012- 确保理解对数函数的定义及其性质，可以通过练习加深理解。\012\012【参考资料】\012暂无。','\012',char(10)),'{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":331,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.0001655","completion_tokens":314,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.000471","total_tokens":645,"total_price":"0.0006365","currency":"USD","latency":0.07194333337247372}}',1754969356887);
INSERT INTO Message VALUES('cme7zlp0o004hgjfjrn23ybhl','980db88e-b9b6-45a8-9c8a-16e786a7fb19','user','对数函数和倒数函数有啥异同点',NULL,1754969624808);
INSERT INTO Message VALUES('cme7zlp0s004jgjfjjtlll1lk','980db88e-b9b6-45a8-9c8a-16e786a7fb19','assistant',replace('【解题思路】\n对数函数和倒数函数都是数学中常见的函数类型，但它们在定义和性质上有一些不同之处。\n\n【步骤】\n1. **定义**：\n   - 对数函数：以一个固定的正数为底数的对数函数，通常用 $\log_a x$ 表示。\n   - 倒数函数：对于一个非零实数 $x$，其倒数为 $\frac{1}{x}$，通常用 $f(x) = \frac{1}{x}$ 表示。\n\n2. **性质**：\n   - 对数函数：\n     - 对数函数的定义域是正实数集合 $(0, +\infty)$，值域是实数集合 $(-\infty, +\infty)$。\n     - 对数函数是递增函数。\n   - 倒数函数：\n     - 倒数函数的定义域是整个实数集合 $\mathbb{R}$，值域也是整个实数集合 $\mathbb{R}$。\n     - 倒数函数在 0 处不存在定义，因为不能除以零。\n     - 倒数函数的图像是一条直线，过原点且斜率为负的曲线。\n\n【答案】\n对数函数是以一个固定的正数为底数的对数函数，倒数函数是一个数的倒数。两者在定义域、值域和性质上有所不同。\n\n【易错点/检查】\n- 注意对数函数的底数不能为0或负数，倒数函数在定义时要避免除以零的情况。\n- 理解两种函数的定义和性质，可以帮助区分它们的区别。\n\n【参考资料】\n暂无。','\n',char(10)),'{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":667,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.0003335","completion_tokens":466,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.000699","total_tokens":1133,"total_price":"0.0010325","currency":"USD","latency":0.02622055821120739}}',1754969624813);
CREATE TABLE IF NOT EXISTS "Assignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classroomId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueAt" DATETIME,
    "items" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Assignment_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "AnswerCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "normHash" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "subject" TEXT,
    "grade" TEXT,
    "answerMd" TEXT NOT NULL,
    "meta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO AnswerCache VALUES('cme7b57if000mgjfj843bvm9o','049e2b7db8aadeaf1059f1cf551078338e5613d64473edbc8194cc58afef3201','你好','数学','高一','你好，请问有什么数学问题我可以帮忙解答的吗？','{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":321,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.0001605","completion_tokens":24,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.000036","total_tokens":345,"total_price":"0.0001965","currency":"USD","latency":0.02198820374906063}}',1754928544839);
INSERT INTO AnswerCache VALUES('cme7wa94e000tgjfjahdb43r2','46ccce6b7148ef5938668f34654f209d1dedf8b9ff8e40a125718f38a1946b8f','111','数学','高一','抱歉，请问你需要关于什么内容的数学的帮助？','{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":320,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.00016","completion_tokens":26,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.000039","total_tokens":346,"total_price":"0.000199","currency":"USD","latency":0.4252129120286554}}',1754964052143);
INSERT INTO AnswerCache VALUES('cme7waq9r000zgjfjngcddmqv','11db636b9882e724ac7fd133f92c1d8c0803b2d25bc2515c5f028aa11f446f62','2x+1>5 的答案是什么?','数学','高一',replace('【解题思路】\n要解不等式 \(2x + 1 > 5\)，我们需要将 x 的解表示出来。\n\n【步骤】\n1. 首先，将不等式 \(2x + 1 > 5\) 转化为等式 \(2x + 1 = 5\)，即 \(2x = 4\)。\n2. 然后，将等式 \(2x = 4\) 求解得到 x = 2。\n\n【答案】\n不等式 \(2x + 1 > 5\) 的解为 x > 2。\n\n【易错点/检查】\n在计算过程中，要注意不等式的符号变化，确保计算准确无误。\n\n【参考资料】\n无。','\n',char(10)),'{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":334,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.000167","completion_tokens":189,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.0002835","total_tokens":523,"total_price":"0.0004505","currency":"USD","latency":0.47980266623198986}}',1754964074367);
INSERT INTO AnswerCache VALUES('cme7wcapj0015gjfju9yopo73','9a04f1663990aa422552188829e2d436f6bc84248f6d3fcde9baa6b2c1fdcb91','共轭双曲线怎么定义?','数学','高一',replace('\n【解题思路】\n共轭双曲线是平面上的一种特殊曲线，它的定义通过几何性质或者学方程来描述。\n\n【步骤】\n1. **几何定义：** 共轭双曲线是平面上两条互相共轭的双曲线。即，对于平面上的两条双曲线，它们的渐近线（无限远处的曲线）互相垂直，且互为渐近线的交点在无穷远处。两条双曲线的渐近线一共有四条，两两互相垂直。\n\n2. **数学方程定义：** 共轭双曲线可以通过以下方程来描述：\n   - 第一种形式：$\frac{x^2}{a^2} - \frac{y^2}{b^2} = 1$ 和 $\frac{x^2}{b^2} - \frac{y^2}{a^2} = 1$，其中 $a$ 和 $b$ 为正实数。\n   - 第二种形式：$y^2 - x^2 = a^2 - b^2$ 和 $y^2 - x^2 = b^2 - a^2$，其中 $a$ 和 $b$ 为正实数。\n\n3. **特点：** 共轭双曲线的焦点在坐标原点附近，开口朝向 $x$ 轴和 $y$ 轴。\n\n【答案】\n共轭双曲线的定义可以通过几何性质和数学方程两种方式来描述，其中数学方程是最常见的表达方式。\n\n【易错点/检查】\n- 注意区分共轭双曲线和普通双曲线的性质和定义。\n- 理解共轭双曲线的特点和数学方程的表达形式。\n\n【参考','\n',char(10)),'{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":332,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.000166","completion_tokens":512,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.000768","total_tokens":844,"total_price":"0.000934","currency":"USD","latency":0.009195139165967703}}',1754964147512);
INSERT INTO AnswerCache VALUES('cme7wdcln001bgjfjlr6q6ggy','de3a5e335314019c826b3b6dbbd0852329616961a9b6ab968acb9c8fa2b2f58c','你没说完','数学','高一','非常抱歉！请问有什么数学问题我可以帮你解呢？','{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":323,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.0001615","completion_tokens":27,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.0000405","total_tokens":350,"total_price":"0.000202","currency":"USD","latency":0.26408851495943964}}',1754964196620);
INSERT INTO AnswerCache VALUES('cme7wgj0i001igjfjxjw5vbgx','0e7d9e88c2d34e6660183791f720853bd3d00711819e5da630d96d97f984236f','你好呀','数学','高一','你好！有什么数学问题我可以帮忙解答呢？','{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":323,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.0001615","completion_tokens":22,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.000033","total_tokens":345,"total_price":"0.0001945","currency":"USD","latency":0.041676206048578024}}',1754964344899);
INSERT INTO AnswerCache VALUES('cme7whhl4001ygjfjblqig18s','7065c746c7cf75d6f3205416ed61c2402e813b4c5b79f71b2cdebfa4091e5452','共轭双曲线','数学','高一',replace('**解题思路**\n共轭双曲线是平面上的一类曲线，具有特定的几何性质可以通过方程的形式来描述。在解题时，我们首先需要了解共轭双曲线的定义和性质，然后根据具体的题目要求来进行分析和求解。\n\n**步骤**\n1. 确定共轭双曲线的标准方程为：$\frac{x^2}{a^2} - \frac{y^2}{b^2} = 1$。\n2. 判断给出的方程是否符合共轭双曲线的标准方程形式。如果是标准形式，可以直接判断是共轭双曲线；如果不是标准形式，需要进行适当的变换，使其符合标准形式。\n3. 根据方程中的参数$a$和$b$的值，可以确定共轭双曲线的具体形状和位置。\n4. 根据题目要求，进行相应的计算和分析，得出结论。\n\n**答案**\n根据具体的题目内容，给出对共轭双曲线的相关描述和结论。\n\n**易错点/检查**\n- 确认方程是否符合共轭双曲线的标准形式。\n- 注意计算过程中的代数运算和符号使用。\n\n**参考资料**\n- 《高中数学》\n- [共轭双曲线 - 百度百科](https://baike.baidu.com/item/%E5%85%B1%E8%BD%AD%E5%8F%8C%E6%9B%B2%E7%BA%BF)','\n',char(10)),'{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":327,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.0001635","completion_tokens":448,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.000672","total_tokens":775,"total_price":"0.0008355","currency":"USD","latency":1.1943382360041142}}',1754964389704);
INSERT INTO AnswerCache VALUES('cme7wknvq002agjfjaxsem7f7','ff37b9fb22b836fad9f6beb40f387986989de2ee8f1ae4ff6952adea1e8b909b','解题思路是什么?','数学','高一','对不起，我需要更多的信息才能为您提供解题思路。请提供具体的题目或问题，我会尽力帮助您解答。','{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":328,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.000164","completion_tokens":47,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.0000705","total_tokens":375,"total_price":"0.0002345","currency":"USD","latency":0.3319159559905529}}',1754964537830);
INSERT INTO AnswerCache VALUES('cme7ysiyt002ggjfj6le0bwwt','62fd7c6ff2f3148cb026cc6fb6f6cf48f2d477b69a5d684cbe737579f2f6ab3c','共轭双曲线的解法?','数学','高一',replace('## 解题思路\n共轭双曲线是二次函数的图像，其定义方程一般为 $\dfrac{x^2}{a^2} - \dfrac{y^2}{b^2} = 1$ 或 $\dfrac{y^2}{b^2} - \dfrac{x^2}{a^2} = 1$。我们可以通过一些特征来确定共轭双曲线的性质和图像。\n\n## 步骤\n1. 确定方程形式：根据方程的形式确定是哪种共轭双曲线。\n2. 确定中心和焦点：找出中心和焦点的坐标。\n3. 确定长轴和短轴：根据方程中的参数确定长轴和短轴的长度。\n4. 绘制图像：根据以上信息绘制共轭双曲线的图像。\n\n## 答案\n待定\n\n## 易错点/检查\n- 方程形式是否正确确定。\n- 中心和焦点的坐标计算是否准确。\n- 长轴和短轴的长度是否正确计算。\n\n## 参考资料\n- [共轭双曲线 - 百度百科](https://baike.baidu.com/item/%E5%85%B1%E8%BD%AD%E5%8F%8C%E6%9B%B2%E7%BA%BF)','\n',char(10)),'{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":331,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.0001655","completion_tokens":376,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.000564","total_tokens":707,"total_price":"0.0007295","currency":"USD","latency":0.24679701309651136}}',1754968263941);
INSERT INTO AnswerCache VALUES('cme7zfyag004egjfj16olltv0','6f03f9fff7ce08259afe814a92145a75d528b479ba0872f984b8632991acdcec','我想知道什么是对数函数','数学','高一',replace('【解题思路】\012对数函数是指以一个固定的正数为底数的对数函数，通常用 $\log_a x$ 表示，其中 $a$ 为底数，$x$ 为真数。对数函数可以帮助我们解决指数函数的反问题。\012\012【步骤】\012对数函数的定义：\012- 如果 $a > 0$ 且 $a \neq 1$，那么对于任意正实数 $x$，$\log_a x = y$ 当且仅当 $a^y = x$。\012- 当 $a = 10$ 时，常用的对数函数是以 10 为底的常用对数函数 $\log x$，即 $\log x = y$ 当且仅当 $10^y = x$。\012\012【答案】\012对数函数是以一个固定的正数为底数的对数函数，通常用 $\log_a x$ 表示。\012\012【易错点/检查】\012- 对数函数的底数不能为0或负数，且不能为1。\012- 确保理解对数函数的定义及其性质，可以通过练习加深理解。\012\012【参考资料】\012暂无。','\012',char(10)),'{"annotation_reply":null,"retriever_resources":[],"usage":{"prompt_tokens":331,"prompt_unit_price":"0.0005","prompt_price_unit":"0.001","prompt_price":"0.0001655","completion_tokens":314,"completion_unit_price":"0.0015","completion_price_unit":"0.001","completion_price":"0.000471","total_tokens":645,"total_price":"0.0006365","currency":"USD","latency":0.07194333337247372}}',1754969356888);
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "path" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    "latencyMs" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO AuditLog VALUES('cme7386zo0000gjo1uz4qltds','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754915247204);
INSERT INTO AuditLog VALUES('cme7386zp0001gjo10dxnfy7t','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754915247205);
INSERT INTO AuditLog VALUES('cme73883b0002gjo1ieot6pvy','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754915248632);
INSERT INTO AuditLog VALUES('cme73883c0003gjo1wf993t9k','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754915248633);
INSERT INTO AuditLog VALUES('cme7388920004gjo1jtgfgmcz','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754915248839);
INSERT INTO AuditLog VALUES('cme74v5eq0005gjo1jeeou04w','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754917997858);
INSERT INTO AuditLog VALUES('cme74v5jo0006gjo1hp3yjwvm','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754917998036);
INSERT INTO AuditLog VALUES('cme74vc910007gjo1e45tz86p','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754918006725);
INSERT INTO AuditLog VALUES('cme74vcmp0008gjo1f7ag4vdy','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754918007217);
INSERT INTO AuditLog VALUES('cme74wzlf0009gjo11ch8fgrd','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754918083635);
INSERT INTO AuditLog VALUES('cme74wzso000agjo1hh24c3pk','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754918083896);
INSERT INTO AuditLog VALUES('cme74x2gm000bgjo1p62jug68','1','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"math","limit":5,"itemCount":5,"source":"mock"}',NULL,1754918087350);
INSERT INTO AuditLog VALUES('cme751eh8000cgjo1g6v0p7jn','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754918289547);
INSERT INTO AuditLog VALUES('cme751eio000dgjo1luzt36em','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754918289600);
INSERT INTO AuditLog VALUES('cme751esn000egjo1sql09mhy','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754918289960);
INSERT INTO AuditLog VALUES('cme752nhd000fgjo1c6gih5t1','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754918347873);
INSERT INTO AuditLog VALUES('cme752niq000ggjo1jioqo4qj','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754918347922);
INSERT INTO AuditLog VALUES('cme753opa000hgjo196cjf8bm','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754918396110);
INSERT INTO AuditLog VALUES('cme753os1000igjo1wr1sbu4n','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754918396209);
INSERT INTO AuditLog VALUES('cme753us0000jgjo166lh5bfu','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754918403984);
INSERT INTO AuditLog VALUES('cme753v65000kgjo1cwqld63a','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754918404494);
INSERT INTO AuditLog VALUES('cme75goo00001gj9h0rqqnlk2','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754919002593);
INSERT INTO AuditLog VALUES('cme75goo00000gj9hg3u208nd','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754919002593);
INSERT INTO AuditLog VALUES('cme75goo00002gj9h51d425c2','1','/api/conversations','GET_CONVERSATIONS','{"conversationCount":0}',NULL,1754919002593);
INSERT INTO AuditLog VALUES('cme75gr4u0003gj9h86vf7nws','1','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"math","limit":5,"itemCount":5,"source":"mock"}',NULL,1754919005790);
INSERT INTO AuditLog VALUES('cme75h6540004gj9hbbj4hceh','1','/api/attempt/submit','SUBMIT_ATTEMPT','{"itemId":"math-003","correct":true,"timeMs":18642,"source":"mock"}',18642,1754919025241);
INSERT INTO AuditLog VALUES('cme75nlko0005gj9hrscp3728','1','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"math","limit":5,"itemCount":5,"source":"mock"}',NULL,1754919325176);
INSERT INTO AuditLog VALUES('cme75o7pc0006gj9h45sqc923','1','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"math","limit":5,"itemCount":5,"source":"mock"}',NULL,1754919353856);
INSERT INTO AuditLog VALUES('cme77na1v0001gjw0r92nsau3','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"nihao","subject":"数学","grade":"高一","kb_hit":false}',6147,1754922669475);
INSERT INTO AuditLog VALUES('cme781eyo0002gjw0kkud37y8','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',6294,1754923329024);
INSERT INTO AuditLog VALUES('cme786sr80000gj27cpdgqohn','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你还","subject":"数学","grade":"高一","kb_hit":false}',5804,1754923580180);
INSERT INTO AuditLog VALUES('cme78ahq20000gj9hgh0je46q','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',5841,1754923752506);
INSERT INTO AuditLog VALUES('cme78bh1h0000gj48p6nk1e44','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',5794,1754923798277);
INSERT INTO AuditLog VALUES('cme78e7us0001gj484ty2t9mp','cme72pyir0000gjrl4eye3axu','/api/qa/stream','CONVERSATION_CONTINUE','{"query":"你还","subject":"数学","grade":"高一","conversationId":"conv_1754923913858_n9byjnpkc","kb_hit":false}',6498,1754923926341);
INSERT INTO AuditLog VALUES('cme78foqz0002gj48aa2gw6sm','cme72pyir0000gjrl4eye3axu','/api/qa/stream','CONVERSATION_CONTINUE','{"query":"你好","subject":"数学","grade":"高一","conversationId":"conv_1754923913858_n9byjnpkc","kb_hit":false}',6642,1754923994892);
INSERT INTO AuditLog VALUES('cme78gfel0003gj48jjkrwl3w','cme72pyir0000gjrl4eye3axu','/api/qa/stream','CONVERSATION_CONTINUE','{"query":"你好","subject":"数学","grade":"高一","conversationId":"conv_1754923913858_n9byjnpkc","kb_hit":false}',6011,1754924029437);
INSERT INTO AuditLog VALUES('cme78opmt0004gj48tw9gbr3g','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',5829,1754924415941);
INSERT INTO AuditLog VALUES('cme78otih0005gj48vihftrgu','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',730,1754924420969);
INSERT INTO AuditLog VALUES('cme78qph00006gj48wcy5npi0','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',6082,1754924509045);
INSERT INTO AuditLog VALUES('cme78s06y0007gj48smfczeto','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',6335,1754924569594);
INSERT INTO AuditLog VALUES('cme78zj0x0008gj4893sdnau0','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',6059,1754924920593);
INSERT INTO AuditLog VALUES('cme791bso0009gj4897stt1ob','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',6046,1754925004536);
INSERT INTO AuditLog VALUES('cme793578000agj48skxyt56o','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',5926,1754925089300);
INSERT INTO AuditLog VALUES('cme7955p50000gj852d5ot69w','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',6228,1754925183257);
INSERT INTO AuditLog VALUES('cme79a0x30000gjfjkeg9el43','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',6087,1754925410344);
INSERT INTO AuditLog VALUES('cme79flps0001gjfjgun169fb','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好哦","subject":"数学","grade":"高一","kb_hit":false}',5977,1754925670576);
INSERT INTO AuditLog VALUES('cme79maxa0002gjfjcnlss6od','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',1207,1754925983182);
INSERT INTO AuditLog VALUES('cme79nq2l0003gjfj7nxyjdnr','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',1559,1754926049469);
INSERT INTO AuditLog VALUES('cme79plv60004gjfjnb4tprbg','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',1005,1754926137331);
INSERT INTO AuditLog VALUES('cme79qd8y0005gjfjv3jwmry3','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',1016,1754926172818);
INSERT INTO AuditLog VALUES('cme79u7hj0006gjfjgv4a7kkn','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',1117,1754926351975);
INSERT INTO AuditLog VALUES('cme79vcfu0007gjfjll1si3kz','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',1012,1754926405051);
INSERT INTO AuditLog VALUES('cme7a3njv0008gjfjae893yf8','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',998,1754926792699);
INSERT INTO AuditLog VALUES('cme7a4hbn0009gjfj1tm6owgd','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',980,1754926831283);
INSERT INTO AuditLog VALUES('cme7a7xil000agjfjttis6kx3','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',1398,1754926992238);
INSERT INTO AuditLog VALUES('cme7ab16d000bgjfjzgqpx87k','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',1067,1754927136948);
INSERT INTO AuditLog VALUES('cme7ahnig000cgjfj5ggcan0y','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',826,1754927445832);
INSERT INTO AuditLog VALUES('cme7aiod9000dgjfjul970zcw','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',5990,1754927493597);
INSERT INTO AuditLog VALUES('cme7ak3ra000egjfjst8r5io2','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',624,1754927560198);
INSERT INTO AuditLog VALUES('cme7axu1y000fgjfj1m85og8b','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',232,1754928200806);
INSERT INTO AuditLog VALUES('cme7b051m000ggjfjpsq2drjl','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"共轭双曲线 是什么","subject":"数学","grade":"高一","kb_hit":false}',814,1754928308362);
INSERT INTO AuditLog VALUES('cme7b2pyw000hgjfj302mnb2h','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","kb_hit":false}',6087,1754928428792);
INSERT INTO AuditLog VALUES('cme7b57ii000ngjfjec7rll5d','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好","subject":"数学","grade":"高一","conversationId":"f9520346-a9a5-48f2-8e5c-91f74328ffb4","kb_hit":false}',6130,1754928544842);
INSERT INTO AuditLog VALUES('cme7wa0qv000ogjfjfievf4yx','cme72pyir0000gjrl4eye3axu','/api/qa/stream','CACHE_HIT','{"query":"你好","subject":"数学","grade":"高一"}',36,1754964041288);
INSERT INTO AuditLog VALUES('cme7wa94g000ugjfjqqoq0wxp','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"111","subject":"数学","grade":"高一","conversationId":"a965a540-0f86-4339-953a-6cb17fe91c81","kb_hit":false}',3895,1754964052145);
INSERT INTO AuditLog VALUES('cme7waq9t0010gjfjbqplmjeo','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"2x+1>5 的答案是什么?","subject":"数学","grade":"高一","conversationId":"1aa0ae80-4b2d-4dc9-aabb-0ccc8bae936b","kb_hit":false}',3861,1754964074369);
INSERT INTO AuditLog VALUES('cme7wcapl0016gjfj0809rudk','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"共轭双曲线怎么定义?","subject":"数学","grade":"高一","conversationId":"2532c8ee-2325-4792-af5f-4edff5e3af32","kb_hit":false}',5532,1754964147513);
INSERT INTO AuditLog VALUES('cme7wdclp001cgjfjoo4q3igm','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你没说完","subject":"数学","grade":"高一","conversationId":"a2d06cd8-b377-468c-9a64-045589d2083f","kb_hit":false}',2597,1754964196622);
INSERT INTO AuditLog VALUES('cme7wgdzr001dgjfjguogqqhz','cme72pyir0000gjrl4eye3axu','/api/qa/stream','CACHE_HIT','{"query":"你好","subject":"数学","grade":"高一"}',6,1754964338391);
INSERT INTO AuditLog VALUES('cme7wgj0k001jgjfj86dy7o3z','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"你好呀","subject":"数学","grade":"高一","conversationId":"ed5180f5-631e-4a9e-8bd3-7f262d945b1d","kb_hit":false}',3036,1754964344901);
INSERT INTO AuditLog VALUES('cme7wgupq001ogjfjlw9ol4f9','cme72pyir0000gjrl4eye3axu','/api/qa/stream','CONVERSATION_CONTINUE','{"query":"共轭双曲线是什么?》","subject":"数学","grade":"高一","conversationId":"ed5180f5-631e-4a9e-8bd3-7f262d945b1d","kb_hit":false}',4173,1754964360063);
INSERT INTO AuditLog VALUES('cme7wh38i001tgjfjxcfayf3y','cme72pyir0000gjrl4eye3axu','/api/qa/stream','CONVERSATION_CONTINUE','{"query":"给我出个题再","subject":"数学","grade":"高一","conversationId":"ed5180f5-631e-4a9e-8bd3-7f262d945b1d","kb_hit":false}',3524,1754964371107);
INSERT INTO AuditLog VALUES('cme7whhl5001zgjfj1j4cpouo','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"共轭双曲线","subject":"数学","grade":"高一","conversationId":"d2951271-c1a3-4856-b721-a37414c610cf","kb_hit":false}',5511,1754964389706);
INSERT INTO AuditLog VALUES('cme7whpfz0024gjfjgy3y5uep','cme72pyir0000gjrl4eye3axu','/api/qa/stream','CONVERSATION_CONTINUE','{"query":"具体例题有吗","subject":"数学","grade":"高一","conversationId":"d2951271-c1a3-4856-b721-a37414c610cf","kb_hit":false}',2103,1754964399887);
INSERT INTO AuditLog VALUES('cme7wk7uo0025gjfj50571ujs','cme72pyir0000gjrl4eye3axu','/api/qa/stream','CACHE_HIT','{"query":"共轭双曲线","subject":"数学","grade":"高一"}',20,1754964517056);
INSERT INTO AuditLog VALUES('cme7wknvr002bgjfj2eullyns','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"解题思路是什么?","subject":"数学","grade":"高一","conversationId":"62b3db74-809f-4273-bcda-e952ef52f616","kb_hit":false}',3549,1754964537832);
INSERT INTO AuditLog VALUES('cme7ysj02002hgjfj61ainc59','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"共轭双曲线的解法?","subject":"数学","grade":"高一","conversationId":"465a38d8-c10a-4947-98dd-00d8ee0ce9b6","kb_hit":false}',5186,1754968263987);
INSERT INTO AuditLog VALUES('cme7yvlg5002mgjfj8mtwch0g','cme72pyir0000gjrl4eye3axu','/api/qa/stream','CONVERSATION_CONTINUE','{"query":"例题有吗?","subject":"数学","grade":"高一","conversationId":"465a38d8-c10a-4947-98dd-00d8ee0ce9b6","kb_hit":false}',2804,1754968407126);
INSERT INTO AuditLog VALUES('cme7z37e6002ngjfj45c5t5xg','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":9}',NULL,1754968762158);
INSERT INTO AuditLog VALUES('cme7z3afx002ogjfj1z78p1y0','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":9}',NULL,1754968766110);
INSERT INTO AuditLog VALUES('cme7z3aqh002pgjfjf4h25aao','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":9}',NULL,1754968766489);
INSERT INTO AuditLog VALUES('cme7z3fge002qgjfj5le6k33y','cme72pyir0000gjrl4eye3axu','/api/conversations/62b3db74-809f-4273-bcda-e952ef52f616/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"62b3db74-809f-4273-bcda-e952ef52f616","messageCount":2}',NULL,1754968772606);
INSERT INTO AuditLog VALUES('cme7z3g4n002rgjfj1cc1xhxj','cme72pyir0000gjrl4eye3axu','/api/conversations/465a38d8-c10a-4947-98dd-00d8ee0ce9b6/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"465a38d8-c10a-4947-98dd-00d8ee0ce9b6","messageCount":4}',NULL,1754968773479);
INSERT INTO AuditLog VALUES('cme7z3ibt002sgjfjrj15sxpv','cme72pyir0000gjrl4eye3axu','/api/conversations/ed5180f5-631e-4a9e-8bd3-7f262d945b1d/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"ed5180f5-631e-4a9e-8bd3-7f262d945b1d","messageCount":6}',NULL,1754968776330);
INSERT INTO AuditLog VALUES('cme7z3it1002tgjfj0zyhmtsw','cme72pyir0000gjrl4eye3axu','/api/conversations/d2951271-c1a3-4856-b721-a37414c610cf/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"d2951271-c1a3-4856-b721-a37414c610cf","messageCount":4}',NULL,1754968776950);
INSERT INTO AuditLog VALUES('cme7z3k50002wgjfjff46e02a','cme72pyir0000gjrl4eye3axu','/api/conversations','CREATE_CONVERSATION','{"conversationId":"cme7z3k4y002vgjfjlu0leeyq","subject":null,"grade":null}',NULL,1754968778677);
INSERT INTO AuditLog VALUES('cme7z3ka7002xgjfjsqeeznk3','cme72pyir0000gjrl4eye3axu','/api/conversations/cme7z3k4y002vgjfjlu0leeyq/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"cme7z3k4y002vgjfjlu0leeyq","messageCount":0}',NULL,1754968778863);
INSERT INTO AuditLog VALUES('cme7z6tiz002ygjfjyxsa0qxl','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754968930812);
INSERT INTO AuditLog VALUES('cme7z6u82002zgjfjkjeqw7dg','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754968931714);
INSERT INTO AuditLog VALUES('cme7z6zi00030gjfjzkw4hvid','cme72pyir0000gjrl4eye3axu','/api/qa/stream','CONVERSATION_CONTINUE','{"query":"长歌行是谁写的?","subject":"语文","grade":"高一","conversationId":"cme7z3k4y002vgjfjlu0leeyq","kb_hit":false}',752,1754968938553);
INSERT INTO AuditLog VALUES('cme7z7h1i0031gjfjubnzvewa','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754968961287);
INSERT INTO AuditLog VALUES('cme7z7h6r0032gjfjt33cqe9j','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754968961475);
INSERT INTO AuditLog VALUES('cme7z7ocq0035gjfjtlbqik1y','cme72pyir0000gjrl4eye3axu','/api/conversations','CREATE_CONVERSATION','{"conversationId":"cme7z7ocn0034gjfj93x5nft6","subject":null,"grade":null}',NULL,1754968970762);
INSERT INTO AuditLog VALUES('cme7z7ogj0036gjfjt4mdmtbj','cme72pyir0000gjrl4eye3axu','/api/conversations/cme7z7ocn0034gjfj93x5nft6/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"cme7z7ocn0034gjfj93x5nft6","messageCount":0}',NULL,1754968970900);
INSERT INTO AuditLog VALUES('cme7z7uu50037gjfjqz153zpi','cme72pyir0000gjrl4eye3axu','/api/qa/stream','CONVERSATION_CONTINUE','{"query":"长歌行是谁写的","subject":"数学","grade":"高一","conversationId":"cme7z7ocn0034gjfj93x5nft6","kb_hit":false}',988,1754968979165);
INSERT INTO AuditLog VALUES('cme7z9zoc0038gjfjyed90fsn','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969078748);
INSERT INTO AuditLog VALUES('cme7z9zqs0039gjfjzyw78a3t','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969078836);
INSERT INTO AuditLog VALUES('cme7za0o1003agjfjkwwtvvbl','cme72pyir0000gjrl4eye3axu','/api/conversations/cme7z3k4y002vgjfjlu0leeyq/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"cme7z3k4y002vgjfjlu0leeyq","messageCount":0}',NULL,1754969080034);
INSERT INTO AuditLog VALUES('cme7za1kv003dgjfjbygfflwq','cme72pyir0000gjrl4eye3axu','/api/conversations','CREATE_CONVERSATION','{"conversationId":"cme7za1kt003cgjfjv8tn6c2k","subject":null,"grade":null}',NULL,1754969081215);
INSERT INTO AuditLog VALUES('cme7za1pj003egjfjh0gn8lt7','cme72pyir0000gjrl4eye3axu','/api/conversations/cme7za1kt003cgjfjv8tn6c2k/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"cme7za1kt003cgjfjv8tn6c2k","messageCount":0}',NULL,1754969081384);
INSERT INTO AuditLog VALUES('cme7za2o7003fgjfj9yhvj1fs','cme72pyir0000gjrl4eye3axu','/api/conversations/cme7z7ocn0034gjfj93x5nft6/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"cme7z7ocn0034gjfj93x5nft6","messageCount":0}',NULL,1754969082632);
INSERT INTO AuditLog VALUES('cme7za387003ggjfj036xwcy3','cme72pyir0000gjrl4eye3axu','/api/conversations/cme7z3k4y002vgjfjlu0leeyq/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"cme7z3k4y002vgjfjlu0leeyq","messageCount":0}',NULL,1754969083352);
INSERT INTO AuditLog VALUES('cme7za3m5003hgjfjjgqexk09','cme72pyir0000gjrl4eye3axu','/api/conversations/cme7z7ocn0034gjfj93x5nft6/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"cme7z7ocn0034gjfj93x5nft6","messageCount":0}',NULL,1754969083854);
INSERT INTO AuditLog VALUES('cme7za3v9003igjfjm66qv3ur','cme72pyir0000gjrl4eye3axu','/api/conversations/cme7za1kt003cgjfjv8tn6c2k/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"cme7za1kt003cgjfjv8tn6c2k","messageCount":0}',NULL,1754969084182);
INSERT INTO AuditLog VALUES('cme7za5sg003jgjfjrkkvwvor','cme72pyir0000gjrl4eye3axu','/api/conversations/cme7z3k4y002vgjfjlu0leeyq/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"cme7z3k4y002vgjfjlu0leeyq","messageCount":0}',NULL,1754969086672);
INSERT INTO AuditLog VALUES('cme7za7to003kgjfj5bpqa3a3','cme72pyir0000gjrl4eye3axu','/api/conversations/465a38d8-c10a-4947-98dd-00d8ee0ce9b6/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"465a38d8-c10a-4947-98dd-00d8ee0ce9b6","messageCount":4}',NULL,1754969089309);
INSERT INTO AuditLog VALUES('cme7zai9k003pgjfjwetblsz6','cme72pyir0000gjrl4eye3axu','/api/qa/stream','CONVERSATION_CONTINUE','{"query":"你给我想一个例题","subject":"数学","grade":"高一","conversationId":"465a38d8-c10a-4947-98dd-00d8ee0ce9b6","kb_hit":false}',3548,1754969102840);
INSERT INTO AuditLog VALUES('cme7zao9u003qgjfjlfslb0mc','cme72pyir0000gjrl4eye3axu','/api/conversations/cme7z3k4y002vgjfjlu0leeyq/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"cme7z3k4y002vgjfjlu0leeyq","messageCount":0}',NULL,1754969110626);
INSERT INTO AuditLog VALUES('cme7zarox003rgjfjm56of0zy','cme72pyir0000gjrl4eye3axu','/api/qa/stream','CONVERSATION_CONTINUE','{"query":"你好","subject":"数学","grade":"高一","conversationId":"cme7z3k4y002vgjfjlu0leeyq","kb_hit":false}',833,1754969115057);
INSERT INTO AuditLog VALUES('cme7zb3u6003sgjfjsszzd08v','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969130799);
INSERT INTO AuditLog VALUES('cme7zb3ws003tgjfj0hoy0ssq','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969130893);
INSERT INTO AuditLog VALUES('cme7zberu003ugjfjujd9gsjt','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969144971);
INSERT INTO AuditLog VALUES('cme7zbewm003vgjfj6obytd1k','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969145143);
INSERT INTO AuditLog VALUES('cme7zcf5k003wgjfj68v9ib5h','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969192120);
INSERT INTO AuditLog VALUES('cme7zcf6a003xgjfjg8j8zm8j','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969192147);
INSERT INTO AuditLog VALUES('cme7zcthn003ygjfj2w14zf83','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969210699);
INSERT INTO AuditLog VALUES('cme7zcthu003zgjfjbvxgokar','cme72pyir0000gjrl4eye3axu','/api/conversations/cme7z3k4y002vgjfjlu0leeyq/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"cme7z3k4y002vgjfjlu0leeyq","messageCount":0}',NULL,1754969210706);
INSERT INTO AuditLog VALUES('cme7zcthx0040gjfj9oo4s0wq','cme72pyir0000gjrl4eye3axu','/api/conversations/cme7z3k4y002vgjfjlu0leeyq/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"cme7z3k4y002vgjfjlu0leeyq","messageCount":0}',NULL,1754969210710);
INSERT INTO AuditLog VALUES('cme7zcy7i0041gjfj1g00eg8b','cme72pyir0000gjrl4eye3axu','/api/conversations/cme7z3k4y002vgjfjlu0leeyq/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"cme7z3k4y002vgjfjlu0leeyq","messageCount":0}',NULL,1754969216814);
INSERT INTO AuditLog VALUES('cme7zcy7i0042gjfj3jrlzsar','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969216815);
INSERT INTO AuditLog VALUES('cme7zcy7i0043gjfjymbm76jn','cme72pyir0000gjrl4eye3axu','/api/conversations/cme7z3k4y002vgjfjlu0leeyq/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"cme7z3k4y002vgjfjlu0leeyq","messageCount":0}',NULL,1754969216815);
INSERT INTO AuditLog VALUES('cme7zd3yq0044gjfjomdqyb2k','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969224274);
INSERT INTO AuditLog VALUES('cme7zd7zk0045gjfjit8zgp0t','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969229489);
INSERT INTO AuditLog VALUES('cme7zf8wc0046gjfjkhje5obd','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969323980);
INSERT INTO AuditLog VALUES('cme7zf8yd0047gjfj6mny3uxz','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969324054);
INSERT INTO AuditLog VALUES('cme7zfboa0048gjfjvo3nfli2','cme72pyir0000gjrl4eye3axu','/api/conversations/cme7za1kt003cgjfjv8tn6c2k/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"cme7za1kt003cgjfjv8tn6c2k","messageCount":0}',NULL,1754969327578);
INSERT INTO AuditLog VALUES('cme7zfl5b0049gjfj2e2u9n0b','cme72pyir0000gjrl4eye3axu','/api/qa/stream','CACHE_HIT','{"query":"你好","subject":"数学","grade":"高一"}',7,1754969339855);
INSERT INTO AuditLog VALUES('cme7zfyai004fgjfjan40rmb4','cme72pyir0000gjrl4eye3axu','/api/qa/stream','DIFY_CALL','{"query":"我想知道什么是对数函数","subject":"数学","grade":"高一","conversationId":"980db88e-b9b6-45a8-9c8a-16e786a7fb19","kb_hit":false}',6050,1754969356891);
INSERT INTO AuditLog VALUES('cme7zlp0u004kgjfj7sdrscl1','cme72pyir0000gjrl4eye3axu','/api/qa/stream','CONVERSATION_CONTINUE','{"query":"对数函数和倒数函数有啥异同点","subject":"数学","grade":"高一","conversationId":"980db88e-b9b6-45a8-9c8a-16e786a7fb19","kb_hit":false}',7207,1754969624815);
INSERT INTO AuditLog VALUES('cme7zlrrx004lgjfj3yck10sd','cme72pyir0000gjrl4eye3axu','/api/conversations/cme7za1kt003cgjfjv8tn6c2k/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"cme7za1kt003cgjfjv8tn6c2k","messageCount":0}',NULL,1754969628382);
INSERT INTO AuditLog VALUES('cme7zlsaq004mgjfjtl39ern2','cme72pyir0000gjrl4eye3axu','/api/conversations/980db88e-b9b6-45a8-9c8a-16e786a7fb19/messages','GET_CONVERSATION_MESSAGES','{"conversationId":"980db88e-b9b6-45a8-9c8a-16e786a7fb19","messageCount":4}',NULL,1754969629058);
INSERT INTO AuditLog VALUES('cme7zlv86004ngjfju6qohesu','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969632855);
INSERT INTO AuditLog VALUES('cme7zlv8z004ogjfj2j6ynfgg','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969632884);
INSERT INTO AuditLog VALUES('cme7zlvel004pgjfjcn6beji3','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969633085);
INSERT INTO AuditLog VALUES('cme7zm0ec004qgjfjtgfurjs2','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969639556);
INSERT INTO AuditLog VALUES('cme7zm0hh004rgjfjf3mjq6z0','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969639670);
INSERT INTO AuditLog VALUES('cme7zmbe0004sgjfjtzcdq2he','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969653801);
INSERT INTO AuditLog VALUES('cme7zmblu004tgjfj79cii9dz','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969654082);
INSERT INTO AuditLog VALUES('cme7zmwg2004ugjfjqwv4e0dr','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969681090);
INSERT INTO AuditLog VALUES('cme7zmwuf004vgjfj0i2xgp0v','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969681607);
INSERT INTO AuditLog VALUES('cme7zn066004wgjfjqtpkwpw7','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969685918);
INSERT INTO AuditLog VALUES('cme7zn2wi004xgjfjc5hnn0a1','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969689459);
INSERT INTO AuditLog VALUES('cme7zn381004ygjfjsn7fctpr','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754969689873);
INSERT INTO AuditLog VALUES('cme803lqz004zgjfj32niv1ze','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754970460379);
INSERT INTO AuditLog VALUES('cme803lyn0050gjfjsz9qqo7t','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754970460655);
INSERT INTO AuditLog VALUES('cme807qcp0051gjfjrfv4gq1w','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754970652970);
INSERT INTO AuditLog VALUES('cme807qg10052gjfjq25ewfv3','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754970653089);
INSERT INTO AuditLog VALUES('cme807u110053gjfjp8bsfqp1','cme72pyir0000gjrl4eye3axu','/api/conversations/cme7za1kt003cgjfjv8tn6c2k','DELETE_CONVERSATION','{"conversationId":"cme7za1kt003cgjfjv8tn6c2k"}',NULL,1754970657734);
INSERT INTO AuditLog VALUES('cme807vgi0054gjfj8nhyb3gm','cme72pyir0000gjrl4eye3axu','/api/conversations/cme7z7ocn0034gjfj93x5nft6','DELETE_CONVERSATION','{"conversationId":"cme7z7ocn0034gjfj93x5nft6"}',NULL,1754970659586);
INSERT INTO AuditLog VALUES('cme807xkp0055gjfje6op36pd','cme72pyir0000gjrl4eye3axu','/api/conversations/cme7z3k4y002vgjfjlu0leeyq','DELETE_CONVERSATION','{"conversationId":"cme7z3k4y002vgjfjlu0leeyq"}',NULL,1754970662330);
INSERT INTO AuditLog VALUES('cme81xtvw0056gjfjc5daxfn3','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754973550221);
INSERT INTO AuditLog VALUES('cme81xty60057gjfjcs9jb3g9','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754973550302);
INSERT INTO AuditLog VALUES('cme82re230058gjfjpxtaoze6','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754974929387);
INSERT INTO AuditLog VALUES('cme82re590059gjfjhep10pgw','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754974929502);
INSERT INTO AuditLog VALUES('cme82rjtd005agjfjd952kzvk','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754974936849);
INSERT INTO AuditLog VALUES('cme82rjxa005bgjfjcf96579q','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754974936990);
INSERT INTO AuditLog VALUES('cme82san2005cgjfj0yro890o','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754974971615);
INSERT INTO AuditLog VALUES('cme82sbjv005dgjfjmnb1ce4r','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754974972795);
INSERT INTO AuditLog VALUES('cme82tck5005egjfj9foednv8','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754975020758);
INSERT INTO AuditLog VALUES('cme82tcns005fgjfjadbgplph','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754975020888);
INSERT INTO AuditLog VALUES('cme82tx51005ggjfjsg3xltgb','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754975047430);
INSERT INTO AuditLog VALUES('cme82tx6t005hgjfj7q2sa50t','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1754975047494);
INSERT INTO AuditLog VALUES('cme9r9o3f0000gj7ep9zhkscz','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":1,"source":"database"}',NULL,1755076559164);
INSERT INTO AuditLog VALUES('cme9r9o3g0001gj7emawuj0tk','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":1,"source":"database"}',NULL,1755076559164);
INSERT INTO AuditLog VALUES('cmexwkp2z0000gjdh0yemglyu','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"weak","limit":10,"returnedCount":10}',NULL,1756536659964);
INSERT INTO AuditLog VALUES('cmexwkp300001gjdhltd9ucfv','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"weak","limit":10,"returnedCount":10}',NULL,1756536659965);
INSERT INTO AuditLog VALUES('cmexwlisq0002gjdh9dc3r0wk','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"all","limit":10,"returnedCount":10}',NULL,1756536698475);
INSERT INTO AuditLog VALUES('cmexwljag0003gjdhgi4i1uks','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"strong","limit":10,"returnedCount":10}',NULL,1756536699112);
INSERT INTO AuditLog VALUES('cmexwllmy0004gjdhkcgwj6gp','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"all","limit":10,"returnedCount":10}',NULL,1756536702155);
INSERT INTO AuditLog VALUES('cmexwllvz0005gjdhpwmd18r4','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"weak","limit":10,"returnedCount":10}',NULL,1756536702480);
INSERT INTO AuditLog VALUES('cmexwlo5c0006gjdh2e46bxl4','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":1,"source":"database"}',NULL,1756536705408);
INSERT INTO AuditLog VALUES('cmexwlo5c0007gjdhknl03iim','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":1,"source":"database"}',NULL,1756536705408);
INSERT INTO AuditLog VALUES('cmexwmwyy0008gjdhsfnekpl7','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":1,"source":"database"}',NULL,1756536763499);
INSERT INTO AuditLog VALUES('cmexwof8o0009gjdh7isu5p0z','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":1,"source":"database"}',NULL,1756536833832);
INSERT INTO AuditLog VALUES('cmexwozmz000agjdhg5fweu0m','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":1,"source":"database"}',NULL,1756536860268);
INSERT INTO AuditLog VALUES('cmexwqa4v000bgjdhr7r7tb6b','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":1,"source":"database"}',NULL,1756536920527);
INSERT INTO AuditLog VALUES('cmexwqjd6000cgjdhwywkowh2','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":1,"source":"database"}',NULL,1756536932490);
INSERT INTO AuditLog VALUES('cmexwqryv000dgjdh5jin6ugt','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":1,"source":"database"}',NULL,1756536943639);
INSERT INTO AuditLog VALUES('cmexwr6no000egjdh0z24dwjo','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":1,"source":"database"}',NULL,1756536962676);
INSERT INTO AuditLog VALUES('cmexwr9ee000fgjdh5qm0vg90','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1756536966231);
INSERT INTO AuditLog VALUES('cmexwr9f1000ggjdh9mmo0036','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1756536966254);
INSERT INTO AuditLog VALUES('cmexwr9fk000hgjdhkp5n82v7','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1756536966273);
INSERT INTO AuditLog VALUES('cmexws8fo000igjdhmhp2rf7z','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1756537011636);
INSERT INTO AuditLog VALUES('cmexws8gk000jgjdhsoay80yk','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1756537011668);
INSERT INTO AuditLog VALUES('cmexwsban000kgjdh3iiyzou7','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":1,"source":"database"}',NULL,1756537015343);
INSERT INTO AuditLog VALUES('cmexwsk37000lgjdhro9htv0w','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":1,"source":"database"}',NULL,1756537026740);
INSERT INTO AuditLog VALUES('cmexwssaw000mgjdhduaynl4g','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":1,"source":"database"}',NULL,1756537037384);
INSERT INTO AuditLog VALUES('cmexwssjj000ngjdhq5ngj737','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":1,"source":"database"}',NULL,1756537037695);
INSERT INTO AuditLog VALUES('cmexx1ibt000ogjdha5m01vda','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":5,"source":"database"}',NULL,1756537444361);
INSERT INTO AuditLog VALUES('cmexx1o62000rgjdhlo6w6kln','cme72pyir0000gjrl4eye3axu','/api/attempt/submit','SUBMIT_ATTEMPT','{"itemId":"cmexwwnot0007gj2n3la7p15q","correct":true,"timeMs":7122,"parentItemId":null,"updateMode":"traditional","conceptUpdates":1,"primaryUpdate":{"conceptId":"concept-function-monotone","oldTheta":0,"newTheta":12.034538681019669,"weight":1},"source":"database"}',7122,1756537451931);
INSERT INTO AuditLog VALUES('cmexx1ppr000ugjdh14y6xbkf','cme72pyir0000gjrl4eye3axu','/api/attempt/submit','SUBMIT_ATTEMPT','{"itemId":"cmexwwnov000fgj2nh2v35wnn","correct":true,"timeMs":2234,"parentItemId":null,"updateMode":"traditional","conceptUpdates":1,"primaryUpdate":{"conceptId":"concept-inequality","oldTheta":0,"newTheta":12.06907678979546,"weight":1},"source":"database"}',2234,1756537453935);
INSERT INTO AuditLog VALUES('cmexx1scl000xgjdhi9l1d89v','cme72pyir0000gjrl4eye3axu','/api/attempt/submit','SUBMIT_ATTEMPT','{"itemId":"cmexwwnou000bgj2nu779tyxz","correct":true,"timeMs":3414,"parentItemId":null,"updateMode":"traditional","conceptUpdates":1,"primaryUpdate":{"conceptId":"concept-quadratic","oldTheta":0,"newTheta":12.103613754121433,"weight":1},"source":"database"}',3414,1756537457349);
INSERT INTO AuditLog VALUES('cmexx1szm0010gjdhfvo3mwyz','cme72pyir0000gjrl4eye3axu','/api/attempt/submit','SUBMIT_ATTEMPT','{"itemId":"cmexwwnou0009gj2nina380da","correct":true,"timeMs":818,"parentItemId":null,"updateMode":"traditional","conceptUpdates":1,"primaryUpdate":{"conceptId":"concept-quadratic","oldTheta":12.10361375412143,"newTheta":23.754745635671632,"weight":1},"source":"database"}',818,1756537458178);
INSERT INTO AuditLog VALUES('cmexx1to00013gjdhghkvuooe','cme72pyir0000gjrl4eye3axu','/api/attempt/submit','SUBMIT_ATTEMPT','{"itemId":"cmexwwnov000dgj2nc7ifbgkm","correct":true,"timeMs":859,"parentItemId":null,"updateMode":"traditional","conceptUpdates":1,"primaryUpdate":{"conceptId":"concept-inequality","oldTheta":12.06907678979546,"newTheta":23.686893720607298,"weight":1},"source":"database"}',859,1756537459057);
INSERT INTO AuditLog VALUES('cmexx1uj50016gjdh3ls85ckk','cme72pyir0000gjrl4eye3axu','/api/attempt/submit','SUBMIT_ATTEMPT','{"itemId":"cmexwwnov000dgj2nc7ifbgkm","correct":true,"timeMs":1978,"parentItemId":null,"updateMode":"traditional","conceptUpdates":1,"primaryUpdate":{"conceptId":"concept-inequality","oldTheta":23.6868937206073,"newTheta":34.90442795971593,"weight":1},"source":"database"}',1978,1756537460178);
INSERT INTO AuditLog VALUES('cmexx1v3p0019gjdhgktty0qm','cme72pyir0000gjrl4eye3axu','/api/attempt/submit','SUBMIT_ATTEMPT','{"itemId":"cmexwwnov000dgj2nc7ifbgkm","correct":true,"timeMs":2719,"parentItemId":null,"updateMode":"traditional","conceptUpdates":1,"primaryUpdate":{"conceptId":"concept-inequality","oldTheta":34.90442795971593,"newTheta":45.73711351715354,"weight":1},"source":"database"}',2719,1756537460918);
INSERT INTO AuditLog VALUES('cmexx1vfd001cgjdhy37sgjmj','cme72pyir0000gjrl4eye3axu','/api/attempt/submit','SUBMIT_ATTEMPT','{"itemId":"cmexwwnov000dgj2nc7ifbgkm","correct":true,"timeMs":3149,"parentItemId":null,"updateMode":"traditional","conceptUpdates":1,"primaryUpdate":{"conceptId":"concept-inequality","oldTheta":45.73711351715354,"newTheta":56.2004317667037,"weight":1},"source":"database"}',3149,1756537461337);
INSERT INTO AuditLog VALUES('cmexx1vof001fgjdho1z4wp09','cme72pyir0000gjrl4eye3axu','/api/attempt/submit','SUBMIT_ATTEMPT','{"itemId":"cmexwwnov000dgj2nc7ifbgkm","correct":true,"timeMs":3464,"parentItemId":null,"updateMode":"traditional","conceptUpdates":1,"primaryUpdate":{"conceptId":"concept-inequality","oldTheta":56.2004317667037,"newTheta":66.309758277393,"weight":1},"source":"database"}',3464,1756537461663);
INSERT INTO AuditLog VALUES('cmexx1vwt001igjdheu11fdjt','cme72pyir0000gjrl4eye3axu','/api/attempt/submit','SUBMIT_ATTEMPT','{"itemId":"cmexwwnov000dgj2nc7ifbgkm","correct":true,"timeMs":3784,"parentItemId":null,"updateMode":"traditional","conceptUpdates":1,"primaryUpdate":{"conceptId":"concept-inequality","oldTheta":66.309758277393,"newTheta":76.08023767233045,"weight":1},"source":"database"}',3784,1756537461965);
INSERT INTO AuditLog VALUES('cmexx1x3v001jgjdh9mef85be','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":5,"source":"database"}',NULL,1756537463516);
INSERT INTO AuditLog VALUES('cmexx20j1001kgjdhj2n1l0m0','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1756537467949);
INSERT INTO AuditLog VALUES('cmexx20j1001lgjdhqgdf0rup','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1756537467950);
INSERT INTO AuditLog VALUES('cmexx20k4001mgjdha1wqdiaq','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1756537467988);
INSERT INTO AuditLog VALUES('cmexx26i0001ngjdhktfa79y7','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"weak","limit":10,"returnedCount":6}',NULL,1756537475688);
INSERT INTO AuditLog VALUES('cmexx26i0001ogjdha8ji4nck','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"weak","limit":10,"returnedCount":6}',NULL,1756537475688);
INSERT INTO AuditLog VALUES('cmexxf8ts001pgjdhtyejy6yl','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"weak","limit":10,"returnedCount":6}',NULL,1756538085232);
INSERT INTO AuditLog VALUES('cmexxflqu001qgjdhs7t2j2rc','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":5,"source":"database"}',NULL,1756538101974);
INSERT INTO AuditLog VALUES('cmexxfwnt001rgjdh23rw6edf','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1756538116121);
INSERT INTO AuditLog VALUES('cmexxfwnt001sgjdhwxjesjne','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1756538116121);
INSERT INTO AuditLog VALUES('cmexxfwra001tgjdhaxuqtnxm','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1756538116246);
INSERT INTO AuditLog VALUES('cmexxfzaw001ugjdhmznaqbqa','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":5,"source":"database"}',NULL,1756538119545);
INSERT INTO AuditLog VALUES('cmexxg9xy001wgjdh5czcxrox','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"weak","limit":10,"returnedCount":6}',NULL,1756538133334);
INSERT INTO AuditLog VALUES('cmexxg9xy001vgjdh67rvz1wx','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"weak","limit":10,"returnedCount":6}',NULL,1756538133334);
INSERT INTO AuditLog VALUES('cmexxgc2k001xgjdh7qfteu3p','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"all","limit":10,"returnedCount":10}',NULL,1756538136093);
INSERT INTO AuditLog VALUES('cmexxgdfw001ygjdhfq8pk84y','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"strong","limit":10,"returnedCount":10}',NULL,1756538137868);
INSERT INTO AuditLog VALUES('cmexxgera001zgjdh316rkjo2','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"all","limit":10,"returnedCount":10}',NULL,1756538139575);
INSERT INTO AuditLog VALUES('cmexxgff70020gjdhva72eftw','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"weak","limit":10,"returnedCount":6}',NULL,1756538140436);
INSERT INTO AuditLog VALUES('cmexxgfz60021gjdh2s4sxoy5','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"all","limit":10,"returnedCount":10}',NULL,1756538141154);
INSERT INTO AuditLog VALUES('cmexxn88e0022gjdhzcv1t0nx','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":5,"source":"database"}',NULL,1756538457710);
INSERT INTO AuditLog VALUES('cmexxnils0025gjdhqeg271cs','cme72pyir0000gjrl4eye3axu','/api/attempt/submit','SUBMIT_ATTEMPT','{"itemId":"cmexwwnoo0001gj2no0a8b7xj","correct":true,"timeMs":13062,"parentItemId":null,"updateMode":"traditional","conceptUpdates":1,"primaryUpdate":{"conceptId":"cme72pyiy0002gjrlnmpjwm3x","oldTheta":0,"newTheta":12.034538681019669,"weight":1},"source":"database"}',13062,1756538471153);
INSERT INTO AuditLog VALUES('cmexxnlt10026gjdhwo2x834o','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"weak","limit":10,"returnedCount":6}',NULL,1756538475301);
INSERT INTO AuditLog VALUES('cmexxnrdj0027gjdhai8i3efg','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"all","limit":10,"returnedCount":10}',NULL,1756538482519);
INSERT INTO AuditLog VALUES('cmexxsyc00028gjdhe37ta619','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"strong","limit":10,"returnedCount":10}',NULL,1756538724816);
INSERT INTO AuditLog VALUES('cmexxt0s60029gjdh9yfaqfn4','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"all","limit":10,"returnedCount":10}',NULL,1756538727991);
INSERT INTO AuditLog VALUES('cmexxt12b002agjdh2kxiqxhk','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"weak","limit":10,"returnedCount":6}',NULL,1756538728356);
INSERT INTO AuditLog VALUES('cmexxt2wh002bgjdh2ipsoaq1','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":5,"source":"database"}',NULL,1756538730737);
INSERT INTO AuditLog VALUES('cmexxt2wm002cgjdhyyfrk249','cme72pyir0000gjrl4eye3axu','/api/practice/next','GET_PRACTICE_ITEMS','{"subject":"数学","limit":5,"itemCount":5,"source":"database"}',NULL,1756538730743);
INSERT INTO AuditLog VALUES('cmexydgo3002dgjdh353q8590','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1756539681699);
INSERT INTO AuditLog VALUES('cmexydgou002egjdhnsipbiu9','cme72pyir0000gjrl4eye3axu','/api/conversations','GET_CONVERSATIONS','{"conversationCount":10}',NULL,1756539681727);
INSERT INTO AuditLog VALUES('cmexydk0v002fgjdhg74j8xzf','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"weak","limit":10,"returnedCount":6}',NULL,1756539686048);
INSERT INTO AuditLog VALUES('cmexydk0v002ggjdhcv1gsk5p','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"weak","limit":10,"returnedCount":6}',NULL,1756539686048);
INSERT INTO AuditLog VALUES('cmexydm9a002hgjdhlz1prbmq','cme72pyir0000gjrl4eye3axu','/api/parent-items/recommend','RECOMMEND_PARENT_ITEMS','{"subject":"数学","grade":"高一","mode":"strong","limit":10,"returnedCount":10}',NULL,1756539688943);
CREATE TABLE IF NOT EXISTS "ParentItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT NOT NULL DEFAULT '数学',
    "grade" TEXT NOT NULL DEFAULT '高一',
    "difficulty" INTEGER NOT NULL DEFAULT 0,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO ParentItem VALUES('M001','M001','函数定义域求解','求函数定义域的基础题型','数学','高一',2,5,1756535496138);
INSERT INTO ParentItem VALUES('M002','M002','二次函数最值问题','二次函数在给定区间的最值','数学','高一',3,5,1756535496140);
INSERT INTO ParentItem VALUES('M003','M003','指数方程求解','基本指数方程的解法','数学','高一',3,4,1756535496141);
INSERT INTO ParentItem VALUES('M004','M004','对数运算与化简','对数的基本运算法则应用','数学','高一',2,4,1756535496141);
INSERT INTO ParentItem VALUES('M005','M005','三角函数图像性质','三角函数的周期、振幅等性质','数学','高一',4,5,1756535496142);
INSERT INTO ParentItem VALUES('M006','M006','向量数量积计算','平面向量数量积的计算','数学','高一',3,3,1756535496143);
INSERT INTO ParentItem VALUES('M007','M007','不等式组求解','一元二次不等式组的解法','数学','高一',3,4,1756535496143);
INSERT INTO ParentItem VALUES('M008','M008','函数单调性判断','判断函数在给定区间的单调性','数学','高一',4,4,1756535496144);
INSERT INTO ParentItem VALUES('M009','M009','复合函数求解','复合函数的定义域值域问题','数学','高一',4,4,1756535496145);
INSERT INTO ParentItem VALUES('M010','M010','函数零点问题','函数零点存在性判断','数学','高一',5,5,1756535496145);
CREATE TABLE IF NOT EXISTS "Skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "subject" TEXT NOT NULL DEFAULT '数学'
);
INSERT INTO Skill VALUES('skill-calculation','计算能力',NULL,'基础能力','数学');
INSERT INTO Skill VALUES('skill-reasoning','逻辑推理',NULL,'思维能力','数学');
INSERT INTO Skill VALUES('skill-modeling','数学建模',NULL,'应用能力','数学');
INSERT INTO Skill VALUES('skill-analysis','分析能力',NULL,'思维能力','数学');
CREATE TABLE IF NOT EXISTS "ItemKnowledgeSkillMap" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT,
    "parentItemId" TEXT,
    "conceptId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "knowledgeWeight" REAL NOT NULL DEFAULT 1.0,
    "skillWeight" REAL NOT NULL DEFAULT 1.0,
    CONSTRAINT "ItemKnowledgeSkillMap_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ItemKnowledgeSkillMap_parentItemId_fkey" FOREIGN KEY ("parentItemId") REFERENCES "ParentItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ItemKnowledgeSkillMap_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ItemKnowledgeSkillMap_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO ItemKnowledgeSkillMap VALUES('cmexvvr2s0001gj0dypfb1r2y',NULL,'M001','concept-function-basic','skill-calculation',0.6999999999999999556,0.8000000000000000444);
INSERT INTO ItemKnowledgeSkillMap VALUES('cmexvvr2t0003gj0dwobn4ypp',NULL,'M001','concept-inequality','skill-reasoning',0.2999999999999999889,0.2000000000000000111);
INSERT INTO ItemKnowledgeSkillMap VALUES('cmexvvr2t0005gj0d7xyf2on8',NULL,'M002','concept-quadratic','skill-analysis',0.8000000000000000444,0.5999999999999999778);
INSERT INTO ItemKnowledgeSkillMap VALUES('cmexvvr2u0007gj0dh1y6qg3t',NULL,'M002','concept-inequality','skill-reasoning',0.2000000000000000111,0.4000000000000000222);
INSERT INTO ItemKnowledgeSkillMap VALUES('cmexvvr2u0009gj0df6figl4d',NULL,'M003','concept-exponential','skill-reasoning',0.9000000000000000222,0.6999999999999999556);
INSERT INTO ItemKnowledgeSkillMap VALUES('cmexvvr2v000bgj0d03nrlb8i',NULL,'M003','concept-function-basic','skill-calculation',0.1000000000000000055,0.2999999999999999889);
INSERT INTO ItemKnowledgeSkillMap VALUES('cmexvvr2v000dgj0dpm5r0ygi',NULL,'M004','concept-logarithm','skill-calculation',1.0,1.0);
INSERT INTO ItemKnowledgeSkillMap VALUES('cmexvvr2w000fgj0d6kfbm9yg',NULL,'M005','concept-trigonometry','skill-analysis',1.0,1.0);
INSERT INTO ItemKnowledgeSkillMap VALUES('cmexvvr2x000hgj0dp30h3mym',NULL,'M006','concept-vector','skill-calculation',1.0,1.0);
INSERT INTO ItemKnowledgeSkillMap VALUES('cmexvvr2x000jgj0ddehad6ue',NULL,'M007','concept-inequality','skill-reasoning',0.9000000000000000222,0.8000000000000000444);
INSERT INTO ItemKnowledgeSkillMap VALUES('cmexvvr2y000lgj0dmnr8un9m',NULL,'M007','concept-function-basic','skill-analysis',0.1000000000000000055,0.2000000000000000111);
INSERT INTO ItemKnowledgeSkillMap VALUES('cmexvvr2y000ngj0dg2pihlwm',NULL,'M008','concept-function-monotone','skill-analysis',0.6999999999999999556,0.9000000000000000222);
INSERT INTO ItemKnowledgeSkillMap VALUES('cmexvvr2z000pgj0dtb9goyx2',NULL,'M008','concept-function-basic','skill-reasoning',0.2999999999999999889,0.1000000000000000055);
INSERT INTO ItemKnowledgeSkillMap VALUES('cmexvvr2z000rgj0dp9mzxr09',NULL,'M009','concept-function-basic','skill-reasoning',0.5999999999999999778,0.5);
INSERT INTO ItemKnowledgeSkillMap VALUES('cmexvvr30000tgj0d1k36t5sh',NULL,'M009','concept-function-monotone','skill-analysis',0.4000000000000000222,0.5);
INSERT INTO ItemKnowledgeSkillMap VALUES('cmexvvr30000vgj0dq0ufdssg',NULL,'M010','concept-function-basic','skill-modeling',0.5,0.4000000000000000222);
INSERT INTO ItemKnowledgeSkillMap VALUES('cmexvvr30000xgj0d9jitnvjf',NULL,'M010','concept-quadratic','skill-analysis',0.2999999999999999889,0.2999999999999999889);
INSERT INTO ItemKnowledgeSkillMap VALUES('cmexvvr31000zgj0df1xe8rk3',NULL,'M010','concept-inequality','skill-reasoning',0.2000000000000000111,0.2999999999999999889);
CREATE TABLE IF NOT EXISTS "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conceptId" TEXT NOT NULL,
    "parentItemId" TEXT,
    "itemType" TEXT NOT NULL DEFAULT 'variant',
    "difficulty" INTEGER NOT NULL DEFAULT 0,
    "stem" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    CONSTRAINT "Item_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Item_parentItemId_fkey" FOREIGN KEY ("parentItemId") REFERENCES "ParentItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO Item VALUES('cmexwwnoo0001gj2no0a8b7xj','cme72pyiy0002gjrlnmpjwm3x',NULL,'variant',1,'{"text":"关于\"代数基础\"的练习题：请写出相关的基本概念","latex":""}','{"answer":"请参考教材相关章节","steps":["复习基本定义","掌握基本性质"]}');
INSERT INTO Item VALUES('cmexwwnor0003gj2ng36u97v3','concept-function-basic',NULL,'variant',1,'{"text":"函数 $f(x) = 2x + 1$ 在 $x = 3$ 时的函数值是多少？","latex":"f(x) = 2x + 1"}','{"answer":"7","steps":["将 x = 3 代入函数","f(3) = 2×3 + 1 = 7"]}');
INSERT INTO Item VALUES('cmexwwnos0005gj2n6pg9qih4','concept-function-basic',NULL,'variant',2,'{"text":"求函数 $f(x) = \\frac{1}{x-2}$ 的定义域","latex":"f(x) = \\frac{1}{x-2}"}','{"answer":"x ≠ 2 或 (-∞,2)∪(2,+∞)","steps":["分母不能为0","x-2 ≠ 0","所以 x ≠ 2"]}');
INSERT INTO Item VALUES('cmexwwnot0007gj2n3la7p15q','concept-function-monotone',NULL,'variant',1,'{"text":"关于\"函数单调性\"的练习题：请写出相关的基本概念","latex":""}','{"answer":"请参考教材相关章节","steps":["复习基本定义","掌握基本性质"]}');
INSERT INTO Item VALUES('cmexwwnou0009gj2nina380da','concept-quadratic',NULL,'variant',2,'{"text":"二次函数 $f(x) = x^2 - 4x + 3$ 的最小值是多少？","latex":"f(x) = x^2 - 4x + 3"}','{"answer":"-1","steps":["配方法：f(x) = (x-2)² - 1","最小值为 -1"]}');
INSERT INTO Item VALUES('cmexwwnou000bgj2nu779tyxz','concept-quadratic',NULL,'variant',3,'{"text":"解方程 $x^2 - 5x + 6 = 0$","latex":"x^2 - 5x + 6 = 0"}','{"answer":"x = 2 或 x = 3","steps":["因式分解：(x-2)(x-3) = 0","所以 x = 2 或 x = 3"]}');
INSERT INTO Item VALUES('cmexwwnov000dgj2nc7ifbgkm','concept-inequality',NULL,'variant',1,'{"text":"解不等式 $2x + 3 > 7$","latex":"2x + 3 > 7"}','{"answer":"x > 2","steps":["2x > 7 - 3","2x > 4","x > 2"]}');
INSERT INTO Item VALUES('cmexwwnov000fgj2nh2v35wnn','concept-inequality',NULL,'variant',2,'{"text":"解不等式组 $\\begin{cases} x + 1 > 0 \\\\ 2x - 3 < 5 \\end{cases}$","latex":"\\begin{cases} x + 1 > 0 \\\\ 2x - 3 < 5 \\end{cases}"}','{"answer":"-1 < x < 4","steps":["x > -1","x < 4","所以 -1 < x < 4"]}');
INSERT INTO Item VALUES('cmexwwnow000hgj2n2e743trh','concept-exponential',NULL,'variant',1,'{"text":"关于\"指数函数\"的练习题：请写出相关的基本概念","latex":""}','{"answer":"请参考教材相关章节","steps":["复习基本定义","掌握基本性质"]}');
INSERT INTO Item VALUES('cmexwwnox000jgj2nb33t2tv4','concept-logarithm',NULL,'variant',1,'{"text":"关于\"对数函数\"的练习题：请写出相关的基本概念","latex":""}','{"answer":"请参考教材相关章节","steps":["复习基本定义","掌握基本性质"]}');
INSERT INTO Item VALUES('cmexwwnox000lgj2nc3mxiqhp','concept-trigonometry',NULL,'variant',2,'{"text":"计算 $\\sin 30° + \\cos 60°$ 的值","latex":"\\sin 30° + \\cos 60°"}','{"answer":"1","steps":["sin 30° = 1/2","cos 60° = 1/2","1/2 + 1/2 = 1"]}');
INSERT INTO Item VALUES('cmexwwnoy000ngj2nann75x8l','concept-vector',NULL,'variant',1,'{"text":"关于\"向量\"的练习题：请写出相关的基本概念","latex":""}','{"answer":"请参考教材相关章节","steps":["复习基本定义","掌握基本性质"]}');
INSERT INTO Item VALUES('cmexwya9x0001gjj9sx10q0r8','concept-function-basic',NULL,'variant',0,'{"text":"函数 f(x) = x + 1 在 x = 2 时的值为多少？","latex":"f(x) = x + 1"}','{"answer":"3","steps":["f(2) = 2 + 1 = 3"]}');
INSERT INTO Item VALUES('cmexwya9y0003gjj933wu6jcn','concept-quadratic',NULL,'variant',1,'{"text":"二次函数 y = x² - 2x + 1 的顶点坐标是？","latex":"y = x² - 2x + 1"}','{"answer":"(1, 0)","steps":["配方：y = (x-1)²","顶点为(1,0)"]}');
INSERT INTO Item VALUES('cmexwya9z0005gjj9p0u7oimr','concept-inequality',NULL,'variant',0,'{"text":"解不等式：x + 2 > 5","latex":"x + 2 > 5"}','{"answer":"x > 3","steps":["x > 5 - 2","x > 3"]}');
INSERT INTO Item VALUES('cmexwyaa00007gjj907z2lk7b','concept-function-basic',NULL,'variant',2,'{"text":"函数 f(x) = √(x-1) 的定义域是？","latex":"f(x) = \\sqrt{x-1}"}','{"answer":"x ≥ 1","steps":["x-1 ≥ 0","x ≥ 1"]}');
INSERT INTO Item VALUES('cmexwyaa10009gjj9ibyduyvz','concept-trigonometry',NULL,'variant',1,'{"text":"sin(90°) 的值是多少？","latex":"\\sin(90°)"}','{"answer":"1","steps":["sin(90°) = 1"]}');
INSERT INTO Item VALUES('cmexx09850001gj9ue7n93j7i','concept-function-basic',NULL,'variant',0,'{"text":"已知函数 f(x) = 3x - 2，求 f(1) 的值","latex":"f(x) = 3x - 2"}','{"answer":"1","steps":["f(1) = 3×1 - 2 = 3 - 2 = 1"]}');
INSERT INTO Item VALUES('cmexx09860003gj9ufs9fc7kn','concept-function-basic',NULL,'variant',1,'{"text":"求函数 $f(x) = \\frac{2}{x+1}$ 的定义域","latex":"f(x) = \\frac{2}{x+1}"}','{"answer":"x ≠ -1","steps":["分母不能为0","x + 1 ≠ 0","x ≠ -1"]}');
INSERT INTO Item VALUES('cmexx09870005gj9uxn9qizdv','concept-quadratic',NULL,'variant',1,'{"text":"解方程 $x^2 - 3x + 2 = 0$","latex":"x^2 - 3x + 2 = 0"}','{"answer":"x = 1 或 x = 2","steps":["(x-1)(x-2) = 0","x = 1 或 x = 2"]}');
INSERT INTO Item VALUES('cmexx09890007gj9uhbmdrdh5','concept-quadratic',NULL,'variant',2,'{"text":"二次函数 $y = -x^2 + 4x - 3$ 的最大值是多少？","latex":"y = -x^2 + 4x - 3"}','{"answer":"1","steps":["配方：y = -(x-2)² + 1","最大值为 1"]}');
INSERT INTO Item VALUES('cmexx098a0009gj9uv2jqxvnb','concept-inequality',NULL,'variant',0,'{"text":"解不等式 $3x - 6 > 0$","latex":"3x - 6 > 0"}','{"answer":"x > 2","steps":["3x > 6","x > 2"]}');
INSERT INTO Item VALUES('cmexx098b000bgj9udpyds2n1','concept-inequality',NULL,'variant',1,'{"text":"解不等式 $-2x + 4 ≤ 0$","latex":"-2x + 4 ≤ 0"}','{"answer":"x ≥ 2","steps":["-2x ≤ -4","x ≥ 2"]}');
INSERT INTO Item VALUES('cmexx098b000dgj9ud3kvhgsa','concept-trigonometry',NULL,'variant',1,'{"text":"计算 $\\cos 0°$ 的值","latex":"\\cos 0°"}','{"answer":"1","steps":["cos 0° = 1"]}');
INSERT INTO Item VALUES('cmexx098c000fgj9u6nity9bc','concept-exponential',NULL,'variant',1,'{"text":"计算 $2^3$ 的值","latex":"2^3"}','{"answer":"8","steps":["2³ = 2 × 2 × 2 = 8"]}');
CREATE TABLE IF NOT EXISTS "Mastery" (
    "userId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "theta" REAL NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "conceptId"),
    CONSTRAINT "Mastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mastery_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO Mastery VALUES('test-elo-user','concept-function-basic',8.448353752856821331,1,1,1756536322587);
INSERT INTO Mastery VALUES('test-elo-user','concept-inequality',1.21643523866548997,2,1,1756536322590);
INSERT INTO Mastery VALUES('test-elo-user','concept-quadratic',-9.51710899670285393,1,0,1756536322590);
INSERT INTO Mastery VALUES('cme72pyir0000gjrl4eye3axu','concept-function-monotone',12.0345386810196704,3,2,1756537975345);
INSERT INTO Mastery VALUES('cme72pyir0000gjrl4eye3axu','concept-inequality',76.08023767233045476,8,7,1756537975347);
INSERT INTO Mastery VALUES('cme72pyir0000gjrl4eye3axu','concept-quadratic',23.75474563567162888,6,5,1756537975347);
INSERT INTO Mastery VALUES('cme72pyir0000gjrl4eye3axu','cme72pyiy0002gjrlnmpjwm3x',12.0345386810196704,1,1,1756538471146);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Enrollment_userId_classroomId_key" ON "Enrollment"("userId", "classroomId");
CREATE INDEX "Attempt_userId_createdAt_idx" ON "Attempt"("userId", "createdAt");
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");
CREATE UNIQUE INDEX "AnswerCache_normHash_key" ON "AnswerCache"("normHash");
CREATE INDEX "Item_conceptId_difficulty_idx" ON "Item"("conceptId", "difficulty");
CREATE INDEX "Item_parentItemId_idx" ON "Item"("parentItemId");
CREATE UNIQUE INDEX "ParentItem_code_key" ON "ParentItem"("code");
CREATE INDEX "ItemKnowledgeSkillMap_itemId_idx" ON "ItemKnowledgeSkillMap"("itemId");
CREATE INDEX "ItemKnowledgeSkillMap_parentItemId_idx" ON "ItemKnowledgeSkillMap"("parentItemId");
CREATE INDEX "ItemKnowledgeSkillMap_conceptId_idx" ON "ItemKnowledgeSkillMap"("conceptId");
COMMIT;
