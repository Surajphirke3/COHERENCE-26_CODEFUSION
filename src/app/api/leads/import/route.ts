import { connectDB } from '@/lib/mongodb/client'
import { Lead } from '@/lib/mongodb/models/Lead'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import Papa from 'papaparse'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const text = await file.text()
    const fileName = file.name.toLowerCase()

    let rows: Record<string, string>[] = []

    if (fileName.endsWith('.csv')) {
      const parsed = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h: string) => h.trim().toLowerCase(),
      })
      rows = parsed.data
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Dynamic import exceljs for xlsx
      const ExcelJS = (await import('exceljs')).default
      const workbook = new ExcelJS.Workbook()
      const buffer = await file.arrayBuffer()
      await workbook.xlsx.load(buffer)

      const worksheet = workbook.worksheets[0]
      if (!worksheet) {
        return NextResponse.json({ error: 'No worksheet found in file' }, { status: 400 })
      }

      const headers: string[] = []
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber - 1] = String(cell.value || '').trim().toLowerCase()
      })

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return
        const obj: Record<string, string> = {}
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1]
          if (header) {
            obj[header] = String(cell.value || '').trim()
          }
        })
        rows.push(obj)
      })
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload .csv or .xlsx' },
        { status: 400 }
      )
    }

    // Auto-detect column mapping
    const headerMap: Record<string, string> = {}
    const sampleHeaders = rows.length > 0 ? Object.keys(rows[0]) : []

    for (const h of sampleHeaders) {
      const hl = h.toLowerCase()
      if (hl.includes('first') && hl.includes('name')) headerMap['firstName'] = h
      else if (hl.includes('last') && hl.includes('name')) headerMap['lastName'] = h
      else if (hl === 'firstname' || hl === 'first') headerMap['firstName'] = h
      else if (hl === 'lastname' || hl === 'last') headerMap['lastName'] = h
      else if (hl === 'name' || hl === 'full name' || hl === 'fullname') headerMap['fullName'] = h
      else if (hl.includes('email')) headerMap['email'] = h
      else if (hl.includes('company') || hl.includes('organization') || hl.includes('org')) headerMap['company'] = h
      else if (hl.includes('title') || hl.includes('position') || hl.includes('role') || hl.includes('designation')) headerMap['title'] = h
      else if (hl.includes('linkedin')) headerMap['linkedinUrl'] = h
      else if (hl.includes('phone') || hl.includes('mobile') || hl.includes('tel')) headerMap['phone'] = h
    }

    // Build lead documents
    const leads = []
    let skipped = 0

    for (const row of rows) {
      let firstName = ''
      let lastName = ''

      if (headerMap['firstName']) {
        firstName = row[headerMap['firstName']] || ''
      }
      if (headerMap['lastName']) {
        lastName = row[headerMap['lastName']] || ''
      }
      if (!firstName && headerMap['fullName']) {
        const parts = (row[headerMap['fullName']] || '').split(' ')
        firstName = parts[0] || ''
        lastName = parts.slice(1).join(' ') || ''
      }

      const email = headerMap['email'] ? row[headerMap['email']] || '' : ''

      if (!firstName || !email || !email.includes('@')) {
        skipped++
        continue
      }

      leads.push({
        firstName,
        lastName: lastName || '',
        email: email.toLowerCase().trim(),
        company: headerMap['company'] ? row[headerMap['company']] || '' : '',
        title: headerMap['title'] ? row[headerMap['title']] || '' : '',
        linkedinUrl: headerMap['linkedinUrl'] ? row[headerMap['linkedinUrl']] || '' : '',
        phone: headerMap['phone'] ? row[headerMap['phone']] || '' : '',
        status: 'new',
        ownerId: session.user.id,
      })
    }

    if (leads.length === 0) {
      return NextResponse.json(
        { error: 'No valid leads found in file. Make sure columns include name and email.' },
        { status: 400 }
      )
    }

    await Lead.insertMany(leads)

    return NextResponse.json({
      success: true,
      count: leads.length,
      skipped,
      message: `Successfully imported ${leads.length} leads${skipped > 0 ? ` (${skipped} skipped)` : ''}`,
    })
  } catch (error) {
    console.error('Lead import error:', error)
    return NextResponse.json({ error: 'Failed to import leads' }, { status: 500 })
  }
}
