import { getHistory, deleteHistoryItem, clearAllHistory } from '../../../../lib/history';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const history = getHistory();
        return NextResponse.json({ data: history });
    } catch (error) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (id) {
            deleteHistoryItem(id);
            return NextResponse.json({ success: true, message: `Record ${id} deleted` });
        } else {
            clearAllHistory();
            return NextResponse.json({ success: true, message: 'All history cleared' });
        }
    } catch (error) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
