package com.dmind.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider

// ฟังก์ชันอำนวยความสะดวกในการสร้าง ViewModel Factory สำหรับ ViewModel ทุกประเภทในแอปพลิเคชัน
fun <T : ViewModel> viewModelFactory(create: () -> T): ViewModelProvider.Factory {
    return object : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <VM : ViewModel> create(modelClass: Class<VM>): VM = create() as VM
    }
}
