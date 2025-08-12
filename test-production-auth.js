// 测试生产环境认证配置
const testAuth = async () => {
  const baseUrl = 'https://jicongcong-ai.vercel.app'
  
  console.log('🔍 测试生产环境认证配置...')
  console.log(`📍 目标URL: ${baseUrl}`)
  
  try {
    // 1. 测试CSRF token获取
    console.log('\n1️⃣ 测试CSRF token获取...')
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`)
    console.log('📊 CSRF响应状态:', csrfResponse.status)
    console.log('📊 CSRF响应头:', Object.fromEntries(csrfResponse.headers.entries()))
    
    const csrfText = await csrfResponse.text()
    console.log('📊 CSRF响应内容:', csrfText.substring(0, 200) + '...')
    
    let csrfData
    try {
      csrfData = JSON.parse(csrfText)
      console.log('✅ CSRF token解析成功:', csrfData.csrfToken ? '已获取' : '未获取')
    } catch (e) {
      console.log('❌ CSRF token解析失败，返回的是HTML页面')
      return
    }
    
    // 2. 测试登录API
    console.log('\n2️⃣ 测试登录API...')
    const loginResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: 'demo',
        password: 'password',
        csrfToken: csrfData.csrfToken,
        json: 'true'
      })
    })
    
    console.log('📊 登录响应状态:', loginResponse.status)
    console.log('📊 登录响应头:', Object.fromEntries(loginResponse.headers.entries()))
    
    const loginText = await loginResponse.text()
    console.log('📊 登录响应内容:', loginText.substring(0, 200) + '...')
    
    let loginData
    try {
      loginData = JSON.parse(loginText)
      console.log('📊 登录响应数据:', loginData)
      
      if (loginResponse.ok && loginData.url) {
        console.log('✅ 登录成功，重定向URL:', loginData.url)
      } else {
        console.log('❌ 登录失败:', loginData.error || '未知错误')
      }
    } catch (e) {
      console.log('❌ 登录响应解析失败，返回的是HTML页面')
    }
    
    // 3. 测试会话状态
    console.log('\n3️⃣ 测试会话状态...')
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`)
    console.log('📊 会话响应状态:', sessionResponse.status)
    
    const sessionText = await sessionResponse.text()
    console.log('📊 会话响应内容:', sessionText.substring(0, 200) + '...')
    
    try {
      const sessionData = JSON.parse(sessionText)
      console.log('📊 会话状态:', sessionData)
    } catch (e) {
      console.log('❌ 会话响应解析失败')
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message)
  }
}

// 运行测试
testAuth()
